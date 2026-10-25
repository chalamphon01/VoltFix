/**
 * ============================================================================
 * VoltFix - Electrician Core JavaScript Module (ฟังก์ชันวิศวกรรมไฟฟ้าและใบเสนอราคา)
 * วิชา: SC362201 Web Application Track | กลุ่ม IT13
 * ผู้พัฒนา: นายชลัมพล พากุล (รหัสนักศึกษา: 683380038-0)
 * 
 * ฟังก์ชันหลักที่ทำงานในโมดูลนี้:
 * 1. Electrical Load & Sizing Calculator (คำนวณกระแส, ขนาดเบรกเกอร์, ขนาดสายไฟ, แรงดันตก % Voltage Drop)
 * 2. Dynamic Quotation Engine (เพิ่ม/ลบรายการ, ปรับจำนวน, คำนวณ VAT 7%, คอมมิชชัน 15%, ยอดสุทธิ Real-time)
 * 3. HTML5 Canvas Digital Signature Pad (กระดานลงลายมือชื่อดิจิทัลรองรับทั้ง Mouse และ Touch Screen)
 * 4. Formal Print & PDF Quotation Generator (จัดรูปแบบเอกสารใบเสนอราคาทางการ A4)
 * ============================================================================
 */

const VoltFixElectrician = (function () {
    'use strict';

    // -------------------------------------------------------------------------
    // ตารางอ้างอิงมาตรฐาน วสท. / IEC สำหรับสายไฟทองแดง (THW ในท่อร้อยสายในผนัง)
    // -------------------------------------------------------------------------
    const WIRE_AMP_TABLE = [
        { size: 1.5, maxAmp: 15, groundSize: 1.5, resistance: 12.1 }, // โอห์มต่อ กม.
        { size: 2.5, maxAmp: 21, groundSize: 2.5, resistance: 7.41 },
        { size: 4.0, maxAmp: 28, groundSize: 4.0, resistance: 4.61 },
        { size: 6.0, maxAmp: 36, groundSize: 6.0, resistance: 3.08 },
        { size: 10.0, maxAmp: 50, groundSize: 10.0, resistance: 1.83 },
        { size: 16.0, maxAmp: 68, groundSize: 10.0, resistance: 1.15 },
        { size: 25.0, maxAmp: 89, groundSize: 16.0, resistance: 0.727 },
        { size: 35.0, maxAmp: 110, groundSize: 16.0, resistance: 0.524 },
        { size: 50.0, maxAmp: 134, groundSize: 25.0, resistance: 0.387 },
        { size: 70.0, maxAmp: 171, groundSize: 35.0, resistance: 0.268 },
        { size: 95.0, maxAmp: 207, groundSize: 50.0, resistance: 0.193 },
        { size: 120.0, maxAmp: 239, groundSize: 70.0, resistance: 0.153 }
    ];

    const STANDARD_BREAKERS = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];

    // =========================================================================
    // 1. ระบบคำนวณวิศวกรรมไฟฟ้า (Electrical Sizing Calculator)
    // =========================================================================
    function calculateElectricalSizing(params) {
        const {
            watts = 0,
            phase = 1,              // 1 (220V) หรือ 3 (380V)
            powerFactor = 0.85,     // cos theta
            lengthMeters = 20,      // ความยาวสาย (เมตร)
            isContinuous = true     // โหลดต่อเนื่อง (คิด Factor 1.25)
        } = params;

        const voltage = phase === 3 ? 380 : 220;
        let current = 0;

        if (phase === 3) {
            // สูตร 3 เฟส: I = P / (sqrt(3) * V * pf)
            current = watts / (Math.sqrt(3) * voltage * powerFactor);
        } else {
            // สูตร 1 เฟส: I = P / (V * pf)
            current = watts / (voltage * powerFactor);
        }

        // โหลดต่อเนื่องคูณ 1.25 เท่า เพื่อความปลอดภัย
        const designCurrent = isContinuous ? current * 1.25 : current;

        // เลือกขนาดเบรกเกอร์ตัวถัดไปที่มากกว่า designCurrent
        let selectedBreaker = STANDARD_BREAKERS[STANDARD_BREAKERS.length - 1];
        for (const b of STANDARD_BREAKERS) {
            if (b >= designCurrent) {
                selectedBreaker = b;
                break;
            }
        }

        // หาขนาดสายไฟที่ทนกระแสได้มากกว่าหรือเท่ากับขนาดเบรกเกอร์
        let selectedWire = WIRE_AMP_TABLE[WIRE_AMP_TABLE.length - 1];
        for (const w of WIRE_AMP_TABLE) {
            if (w.maxAmp >= selectedBreaker) {
                selectedWire = w;
                break;
            }
        }

        // คำนวณค่าแรงดันตก (Voltage Drop: Vd)
        // สำหรับ 1 เฟส: Vd = (2 * I * L * R) / 1000
        // สำหรับ 3 เฟส: Vd = (sqrt(3) * I * L * R) / 1000
        const factor = phase === 3 ? Math.sqrt(3) : 2;
        const vDrop = (factor * current * lengthMeters * selectedWire.resistance) / 1000;
        const vDropPercent = (vDrop / voltage) * 100;

        // หากแรงดันตกเกิน 3% (มาตรฐาน วสท.) ให้แนะนำปรับขนาดสายไฟขึ้น
        let adjustedWire = selectedWire;
        let isOverDrop = vDropPercent > 3.0;

        if (isOverDrop) {
            for (const w of WIRE_AMP_TABLE) {
                const testVDrop = (factor * current * lengthMeters * w.resistance) / 1000;
                const testPercent = (testVDrop / voltage) * 100;
                if (testPercent <= 3.0 && w.size > selectedWire.size) {
                    adjustedWire = w;
                    break;
                }
            }
        }

        return {
            nominalCurrent: parseFloat(current.toFixed(2)),
            designCurrent: parseFloat(designCurrent.toFixed(2)),
            recommendedBreaker: selectedBreaker,
            recommendedWireSize: adjustedWire.size,
            recommendedGroundSize: adjustedWire.groundSize,
            voltageDropVolt: parseFloat(vDrop.toFixed(2)),
            voltageDropPercent: parseFloat(vDropPercent.toFixed(2)),
            isOverDrop: isOverDrop,
            phase: phase,
            voltage: voltage
        };
    }

    // =========================================================================
    // 2. ระบบจัดการใบเสนอราคาแบบ Dynamic (Dynamic Quotation Manager)
    // =========================================================================
    let quotationItems = [];
    let quotationListeners = [];

    function initQuotation(defaultItems = []) {
        quotationItems = defaultItems.length ? defaultItems : [
            { id: 'item_1', name: 'ค่าแรงตรวจเช็คและซ่อมระบบไฟฟ้า', category: 'labor', price: 450, qty: 1, editable: false },
            { id: 'item_2', name: 'อุปกรณ์เล็กน้อย (ตัวยึดสาย เทปพันสายไฟ)', category: 'material', price: 150, qty: 1, editable: true },
            { id: 'item_3', name: 'ค่าเดินทางและบริการนอกสถานที่', category: 'service', price: 50, qty: 1, editable: false }
        ];
        notifyQuotationChange();
    }

    function addQuotationItem(name, category, price, qty = 1) {
        if (!name || price <= 0) return false;
        const newItem = {
            id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            name: name.trim(),
            category: category || 'material',
            price: parseFloat(price) || 0,
            qty: parseInt(qty, 10) || 1,
            editable: true
        };
        quotationItems.push(newItem);
        notifyQuotationChange();
        return newItem;
    }

    function removeQuotationItem(id) {
        quotationItems = quotationItems.filter(item => item.id !== id);
        notifyQuotationChange();
    }

    function updateItemQty(id, newQty) {
        const item = quotationItems.find(i => i.id === id);
        if (item) {
            item.qty = Math.max(1, parseInt(newQty, 10) || 1);
            notifyQuotationChange();
        }
    }

    function getQuotationTotals(discountPercent = 0) {
        let laborTotal = 0;
        let materialTotal = 0;
        let serviceTotal = 0;

        quotationItems.forEach(item => {
            const sub = item.price * item.qty;
            if (item.category === 'labor') laborTotal += sub;
            else if (item.category === 'material') materialTotal += sub;
            else serviceTotal += sub;
        });

        const subtotal = laborTotal + materialTotal + serviceTotal;
        const discountAmount = (subtotal * (parseFloat(discountPercent) || 0)) / 100;
        const afterDiscount = subtotal - discountAmount;
        const vat7 = afterDiscount * 0.07;
        const grandTotal = afterDiscount + vat7;

        // คำนวณส่วนแบ่งช่างไฟ: แพลตฟอร์มหัก 15% เฉพาะค่าแรง
        const platformFee = laborTotal * 0.15;
        const electricianPayout = grandTotal - platformFee;

        return {
            laborTotal,
            materialTotal,
            serviceTotal,
            subtotal,
            discountAmount,
            afterDiscount,
            vat7,
            grandTotal,
            platformFee,
            electricianPayout,
            itemCount: quotationItems.length
        };
    }

    function onQuotationChange(callback) {
        if (typeof callback === 'function') {
            quotationListeners.push(callback);
        }
    }

    function notifyQuotationChange() {
        const totals = getQuotationTotals();
        quotationListeners.forEach(cb => {
            try {
                cb(quotationItems, totals);
            } catch (e) {
                console.error('Error in quotation listener:', e);
            }
        });
        saveQuotationToStorage();
    }

    function saveQuotationToStorage() {
        try {
            const data = {
                items: quotationItems,
                timestamp: Date.now()
            };
            localStorage.setItem('voltfix_quotation_data', JSON.stringify(data));
        } catch (e) {
            // Ignore storage quota errors
        }
    }

    function loadQuotationFromStorage() {
        try {
            const raw = localStorage.getItem('voltfix_quotation_data');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed.items) && parsed.items.length) {
                    quotationItems = parsed.items;
                    notifyQuotationChange();
                    return true;
                }
            }
        } catch (e) {
            // fallback
        }
        return false;
    }

    // =========================================================================
    // 3. กระดานเซ็นชื่อดิจิทัล HTML5 Canvas (Digital Signature Pad)
    // =========================================================================
    class SignaturePad {
        constructor(canvasElement) {
            this.canvas = canvasElement;
            this.ctx = canvasElement.getContext('2d');
            this.isDrawing = false;
            this.hasSignature = false;
            this.initCanvas();
            this.bindEvents();
        }

        initCanvas() {
            // ปรับความละเอียด Retina Display
            const rect = this.canvas.getBoundingClientRect();
            const ratio = window.devicePixelRatio || 1;
            this.canvas.width = (rect.width || 360) * ratio;
            this.canvas.height = (rect.height || 160) * ratio;
            this.ctx.scale(ratio, ratio);

            this.ctx.strokeStyle = '#0F172A';
            this.ctx.lineWidth = 2.5;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.clear();
        }

        bindEvents() {
            // Mouse Events
            this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
            this.canvas.addEventListener('mousemove', (e) => this.draw(e));
            window.addEventListener('mouseup', () => this.stopDrawing());

            // Touch Events (รองรับสมาร์ตโฟน/แท็บเล็ต)
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                this.startDrawing(touch);
            }, { passive: false });

            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                this.draw(touch);
            }, { passive: false });

            this.canvas.addEventListener('touchend', () => this.stopDrawing());
        }

        getCoordinates(event) {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }

        startDrawing(event) {
            this.isDrawing = true;
            const { x, y } = this.getCoordinates(event);
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.hasSignature = true;
        }

        draw(event) {
            if (!this.isDrawing) return;
            const { x, y } = this.getCoordinates(event);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }

        stopDrawing() {
            if (this.isDrawing) {
                this.isDrawing = false;
                this.ctx.closePath();
            }
        }

        clear() {
            const rect = this.canvas.getBoundingClientRect();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.hasSignature = false;
        }

        getDataURL() {
            if (!this.hasSignature) return null;
            return this.canvas.toDataURL('image/png');
        }
    }

    // =========================================================================
    // 4. ระบบสั่งพิมพ์เอกสารใบเสนอราคาทางการ (Print / PDF Formatter)
    // =========================================================================
    function printFormalQuotation(options = {}) {
        const {
            jobTitle = 'งานบริการและซ่อมแซมระบบไฟฟ้า',
            jobId = 'VF-' + Math.floor(1000 + Math.random() * 9000),
            clientName = 'คุณลูกค้า VoltFix',
            clientLocation = 'กรุงเทพมหานคร',
            electricianName = 'นายชลัมพล พากุล (รหัสช่าง 683380038-0)',
            signatureDataUrl = null
        } = options;

        const totals = getQuotationTotals();

        // สร้าง HTML Pop-up สำหรับสั่งพิมพ์
        let rowsHtml = '';
        quotationItems.forEach((item, index) => {
            const categoryName = item.category === 'labor' ? 'ค่าแรง' : item.category === 'material' ? 'อุปกรณ์' : 'บริการ';
            const total = item.price * item.qty;
            rowsHtml += `
                <tr>
                    <td style="text-align:center; padding:10px; border-bottom:1px solid #E2E8F0;">${index + 1}</td>
                    <td style="padding:10px; border-bottom:1px solid #E2E8F0;">
                        <strong>${item.name}</strong>
                        <div style="font-size:12px; color:#64748B;">หมวดหมู่: ${categoryName}</div>
                    </td>
                    <td style="text-align:center; padding:10px; border-bottom:1px solid #E2E8F0;">${item.qty}</td>
                    <td style="text-align:right; padding:10px; border-bottom:1px solid #E2E8F0;">฿${item.price.toLocaleString()}</td>
                    <td style="text-align:right; padding:10px; border-bottom:1px solid #E2E8F0; font-weight:700;">฿${total.toLocaleString()}</td>
                </tr>
            `;
        });

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('กรุณาอนุญาตให้เปิด Pop-up เพื่อพิมพ์ใบเสนอราคา');
            return;
        }

        const dateStr = new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="th">
            <head>
                <meta charset="UTF-8">
                <title>ใบเสนอราคา - ${jobId} | VoltFix Platform</title>
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;600;700;800&display=swap" rel="stylesheet">
                <style>
                    * { box-sizing: border-box; font-family: 'Noto Sans Thai', sans-serif; }
                    body { margin: 0; padding: 40px; color: #0F172A; background: #FFFFFF; font-size: 14px; }
                    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                    .brand { font-size: 26px; font-weight: 800; color: #D97706; }
                    .doc-title { font-size: 24px; font-weight: 800; text-align: right; color: #0F172A; }
                    .info-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                    .items-table th { background: #0F172A; color: #FFFFFF; padding: 10px; font-weight: 700; font-size: 13px; }
                    .summary-box { width: 340px; margin-left: auto; margin-bottom: 30px; }
                    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #E2E8F0; }
                    .total-final { font-size: 18px; font-weight: 800; color: #D97706; border-bottom: 2px solid #D97706; padding: 8px 0; }
                    .footer-signatures { display: flex; justify-content: space-between; margin-top: 40px; page-break-inside: avoid; }
                    .sig-block { width: 220px; text-align: center; border-top: 1px solid #CBD5E1; padding-top: 10px; font-size: 13px; }
                    .sig-img { height: 60px; max-width: 180px; object-fit: contain; margin-bottom: 6px; }
                    @media print {
                        body { padding: 20px; }
                        @page { margin: 15mm; }
                    }
                </style>
            </head>
            <body>
                <table class="header-table">
                    <tr>
                        <td>
                            <div class="brand">⚡ VoltFix</div>
                            <div style="font-size:12px; color:#64748B;">แพลตฟอร์มบริการช่างไฟฟ้ามาตรฐาน (SC362201 IT13)</div>
                        </td>
                        <td class="doc-title">
                            ใบเสนอราคา (QUOTATION)
                            <div style="font-size:13px; font-weight:400; color:#64748B;">เลขที่: ${jobId} · วันที่: ${dateStr}</div>
                        </td>
                    </tr>
                </table>

                <div class="info-box">
                    <div>
                        <div style="font-size:12px; color:#94A3B8; text-transform:uppercase;">ลูกค้า / ผู้ว่าจ้าง</div>
                        <strong style="font-size:16px;">${clientName}</strong>
                        <div>สถานที่: ${clientLocation}</div>
                        <div>ชื่องาน: ${jobTitle}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:12px; color:#94A3B8; text-transform:uppercase;">ช่างไฟฟ้าผู้ประเมิน</div>
                        <strong style="font-size:16px;">${electricianName}</strong>
                        <div>สถานะ: ผ่านการรับรอง KYC (Verified Pro)</div>
                        <div>ใบอนุญาต: ช่างไฟฟ้าภายในอาคารระดับ 1</div>
                    </div>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width:40px;">ลำดับ</th>
                            <th>รายการงาน / อุปกรณ์</th>
                            <th style="width:60px; text-align:center;">จำนวน</th>
                            <th style="width:100px; text-align:right;">ราคา/หน่วย</th>
                            <th style="width:110px; text-align:right;">ยอดรวม</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <div class="summary-box">
                    <div class="summary-row">
                        <span>ยอดรวมค่าแรง:</span>
                        <strong>฿${totals.laborTotal.toLocaleString()}</strong>
                    </div>
                    <div class="summary-row">
                        <span>ยอดรวมค่าอุปกรณ์:</span>
                        <strong>฿${totals.materialTotal.toLocaleString()}</strong>
                    </div>
                    <div class="summary-row">
                        <span>ยอดรวมก่อนภาษี:</span>
                        <span>฿${totals.subtotal.toLocaleString()}</span>
                    </div>
                    <div class="summary-row">
                        <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                        <span>฿${totals.vat7.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div class="summary-row total-final">
                        <span>ยอดรวมสุทธิทั้งสิ้น:</span>
                        <span>฿${totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:12px; font-size:12px; color:#B45309; margin-bottom:30px;">
                    <strong>🛡️ การรับประกันความปลอดภัย VoltFix:</strong> รับประกันคุณภาพงานซ่อมและงานติดตั้ง 1 ปีเต็ม หากเกิดข้อผิดพลาดสามารถติดต่อทีมงานเพื่อส่งช่างเข้าแก้ไขฟรี 24 ชม.
                </div>

                <div class="footer-signatures">
                    <div class="sig-block">
                        <div style="height:60px;"></div>
                        <div>( .................................................... )</div>
                        <div style="color:#64748B;">ลงชื่อ ลูกค้าผู้ตกลงรับราคา</div>
                        <div style="font-size:11px; color:#94A3B8;">วันที่ ...... / ...... / .........</div>
                    </div>
                    <div class="sig-block">
                        ${signatureDataUrl ? `<img src="${signatureDataUrl}" class="sig-img" alt="ลายมือชื่อช่างไฟ">` : '<div style="height:60px;"></div>'}
                        <div>( ${electricianName} )</div>
                        <div style="color:#64748B;">ลงชื่อ ช่างไฟฟ้าผู้จัดทำใบเสนอราคา</div>
                        <div style="font-size:11px; color:#94A3B8;">วันที่ ${dateStr}</div>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    // Public API
    return {
        calculateElectricalSizing,
        initQuotation,
        addQuotationItem,
        removeQuotationItem,
        updateItemQty,
        getQuotationTotals,
        onQuotationChange,
        loadQuotationFromStorage,
        SignaturePad,
        printFormalQuotation
    };
})();

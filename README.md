# ⚡ VoltFix — แพลตฟอร์มบริการช่างไฟฟ้าภายในบ้าน

> **วิชา:** SC362201 Web Application Track  
> **กลุ่ม:** IT13 Section 1  
> **สถานะการตรวจสอบ:** ✅ W3C HTML5 Validated 100% (0 Errors, 0 Warnings ทุกหน้า)

---

## 📌 แนะนำโครงงาน (Project Overview)
**VoltFix** เป็นแพลตฟอร์มศูนย์กลางเชื่อมต่อระหว่างผู้ใช้งานที่มีปัญหาไฟฟ้ารายวัน กับช่างไฟฟ้าผู้มีความเชี่ยวชาญและผ่านการตรวจสอบใบรับรอง (KYC) พร้อมระบบดูแลและติดตามงานแบบครบวงจรสำหรับลูกค้า ช่างไฟ และแอดมิน รวมทั้งหมดกว่า 105 หน้าจอ

---

## 👥 สมาชิกกลุ่ม IT13 ผู้รับผิดชอบ

1. **นายเศรษฐพงษ์ ลิศรี** (รหัสนักศึกษา: `683380572-0`)
   - **ส่วนผู้ดูแลระบบ (Admin Portal):** Dashboard, KYC Approval, Disputes, Finance, Logs
2. **นายวิศวะ ประครองใจ** (รหัสนักศึกษา: `683380268-3`)
   - **ส่วนลูกค้า (Customer Portal):** Home, Services, Multi-step Booking, Chat, Shop, Knowledge Base
3. **นายชลัมพล พากุล** (รหัสนักศึกษา: `683380038-0`)
   - **ส่วนช่างไฟฟ้า (Technician Portal):** Find Work, Work Schedule, Active Jobs, Valuation & Quotation, Wallet, Hardest Screen Showcase (ข้อ 7), Extreme Job Tier

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
Project_code/
├── index.html                   # Project Portal (หน้ารวมทางเข้าทั้ง 3 สิทธิ์และแนะนำโครงงาน)
├── style.css                    # สไตล์ชีทสำหรับหน้า Portal
├── Admin/                       # ส่วนผู้ดูแลระบบ (19 หน้า)
│   ├── css/
│   ├── js/
│   └── *.html
├── Customer/                    # ส่วนลูกค้า (25 หน้า)
│   ├── css_user/
│   ├── img/
│   ├── js/
│   └── *.html
├── Electrician/                 # ส่วนช่างไฟฟ้า (28 หน้า)
│   ├── calculator.html          # ⚡ ฟังก์ชันวิศวกรรมไฟฟ้าที่ยากที่สุด (คำนวณโหลด-สายไฟ-เบรกเกอร์ & Dynamic Quotation & ลายเซ็นดิจิทัล)
│
│
│
│   ├── css/
│   ├── img/
│   ├── js/                      # electrician-core.js (โมดูลคำนวณสูตรไฟฟ้า & Canvas Signature)
│   └── *.html
├── Login/VoltFix - Login/       # ระบบยืนยันตัวตน เข้าสู่ระบบ และสมัครสมาชิก 3 บทบาท (8 หน้า)
│   ├── css/
│   └── *.html
└── docs/                        # เอกสารโครงงานและสไลด์นำเสนอ
```

---

## 🚀 วิธีการเปิดใช้งาน (How to Run)
สามารถเปิดไฟล์ `index.html` บนเว็บเบราว์เซอร์ (Chrome, Edge, Firefox, Safari) เพื่อเริ่มต้นใช้งานได้ทันทีโดยไม่ต้องผ่าน Build Tool

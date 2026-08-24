# HOF (The Hall of Fame)
### เกมจำลองบทบาทภัณฑารักษ์พิพิธภัณฑ์ประวัติศาสตร์ (Classroom History Simulator)

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=flat-square&logo=railway" alt="Railway" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

เว็บแอปพลิเคชันกิจกรรมการเรียนรู้ประวัติศาสตร์สากลและสังคมศึกษา (สงครามเย็น) แบบ **Real-time Multiplayer** สำหรับจัดการเรียนการสอนในชั้นเรียน

นักเรียนจะได้รับบทบาทเป็นทีมภัณฑารักษ์ บริหารงบประมาณ วิเคราะห์หลักฐานทางประวัติศาสตร์ คัดกรองข้อมูลจริง/เท็จ และจัดนิทรรศการลงบนแท่นวางรูปปั้น 3D เสมือนจริง โดยมีคุณครูคุมจังหวะเกมสดจากแผงควบคุม

---

## Core Features

- **แผงควบคุม (`/teacher`)**: สั่งสลับ 4 ขั้นตอนการสอนแบบเรียลไทม์ (`Lobby` ➔ `อ่านบรีฟ` ➔ `ซื้อของจัดแสดง` ➔ `สรุปคะแนน`), ระบบจับเวลานับถอยหลัง และมอนิเตอร์หน้าจอนักเรียน
- **8 ห้องนิทรรศการประวัติศาสตร์สงครามเย็น**: สงครามเกาหลี, เวียดนาม, วิกฤตการณ์คิวบา, สงครามอัฟกานิสถาน, การล่มสลายของกำแพงเบอร์ลิน, ความร่วมมือยุโรป, การก่อตั้งอาเซียน และการค้าโลก (WTO)
- **ห้องจัดแสดง 3D เสมือนจริง**: มุมมองแท่นวางรูปปั้นผ้ากำมะหยี่, ไฟสปอตไลต์เพดาน และแผงกระจกส่องแฟ้มหลักฐาน
- **ระบบวิเคราะห์หลักฐาน (Fact vs Opinion)**: แยกแยะหลักฐานประวัติศาสตร์จริง และหลบหลีกการ์ดกับดักข่าวลวง (Trap Cards)
- **คิดคะแนนอัตโนมัติ**: คำนวณคะแนนความถูกต้อง โบนัสความเร็ว การบริหารเงิน พร้อมระบบกรอกเกณฑ์ประเมินทักษะของครู

---

## Tech Stack

| ส่วนของระบบ | เทค |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) + React 18 |
| **Language** | TypeScript |
| **Styling & UI** | Tailwind CSS + Lucide Icons |
| **Animation** | Framer Motion + Canvas Confetti |
| **Database/State** | In-Memory Server State + บันทึกลงไฟล์ JSON (`data/sessions.json`) |

---

## วิธีติดตั้งและรันในเครื่อง

### 1. Clone โปรเจกต์ & ติดตั้ง Dependencies
```bash
git clone https://github.com/Eterhart/HOF.git
cd HOF
npm install

# 🏛️ Curator: The Historical Exhibition Game
> **เกมจำลองบทบาทภัณฑารักษ์พิพิธภัณฑ์ประวัติศาสตร์ (Cold War Historical Exhibition Simulator)**  
> พัฒนาขึ้นสำหรับกิจกรรมการเรียนรู้ประวัติศาสตร์สากลและสังคมศึกษา (ระดับชั้น ม.3 / มัธยมศึกษา) ในรูปแบบ Interactive Real-time Classroom Web Game

---

## ✨ ไฮไลต์ฟีเจอร์สำคัญ (Key Features)

- 🎮 **Real-time Multiplayer Classroom Game**: นักเรียนเข้าร่วมเล่นเป็นกลุ่มผ่านรหัส PIN หรือ QR Code โดยไม่ต้องติดตั้งแอปพลิเคชัน
- 🕹️ **Game Master Control Dashboard (`/teacher`)**: แผงควบคุมสดสำหรับคุณครู สลับ 4 ขั้นตอนการสอน (Lobby ➔ อ่านบรีฟ ➔ ซื้อของจัดแสดง ➔ จบเกม & สรุปผล) พร้อมระบบจับเวลานับถอยหลังและจำลองมุมมองนักเรียนสด (Live Preview)
- 🏛️ **8 ห้องจัดแสดงประวัติศาสตร์สงครามเย็น (8 Exhibition Rooms)**:
  1. สงครามเกาหลี (1950–1953)
  2. สงครามเวียดนาม (1955–1975)
  3. วิกฤตการณ์คิวบา (1962)
  4. สงครามอัฟกานิสถาน (1979–1989)
  5. กำแพงเบอร์ลินและการล่มสลายของสหภาพโซเวียต (1961–1991)
  6. ความร่วมมือยุโรปและสนธิสัญญาเฮลซิงกิ (1951–1975)
  7. การก่อตั้งอาเซียนและบทบาทไทย (1967)
  8. การค้าโลกและการจัดระเบียบเศรษฐกิจ (1947–1995)
- 🗿 **Interactive 3D Pedestal & Vitrine Gallery**: มุมมองห้องจัดแสดง 3 มิติ พร้อมแท่นวางรูปปั้นผ้ากำมะหยี่, ไฟสปอตไลต์เพดาน, และแผงกระจกส่องข้อมูลไอเทม
- 📜 **Evidence Dossier & QR Scanner**: คลังแฟ้มลับประวัติศาสตร์ ตรวจสอบหลักฐานจริง/หลักฐานเท็จ (Trap Cards)
- 📊 **Rubric Scoring & Leaderboard**: ระบบคำนวณคะแนนอัตโนมัติ พร้อม Rubric การประเมินบทบาทภัณฑารักษ์ของคุณครูและตารางสรุปผลคะแนน

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend & Backend**: [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
- **State & Data**: Server State Store with JSON persistence (`data/sessions.json`)

---

## 🚀 เริ่มต้นใช้งานในเครื่อง (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันโหมด Development
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่:
- **หน้าจอผู้เล่น (Student App):** `http://localhost:3000`
- **หน้าจอแผงควบคุมครู (Teacher Dashboard):** `http://localhost:3000/teacher`
- **หน้าพิพิธภัณฑ์และคลังย้อนหลัง (Archive):** `http://localhost:3000/archive`

### 3. ตรวจสอบ Type & Build สำหรับ Production
```bash
npm run build
npm run start
```

---

## 🌐 การนำไปติดตั้งบนคลาวด์ (Deployment)

### ติดตั้งบน Railway
1. Fork หรือ Push โปรเจกต์ขึ้น GitHub
2. ไปที่ [Railway.app](https://railway.app) แล้วเลือก **New Project** ➔ **Deploy from GitHub repo**
3. Railway จะตรวจจับ Next.js อัตโนมัติ:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. ผูก Custom Domain หรือเปิดใช้งาน Railway Public Domain พร้อมใช้งานได้ทันที

### ติดตั้งบน Vercel
1. นำเข้าโปรเจกต์ผ่าน Dashboard ของ [Vercel](https://vercel.com)
2. Vercel จะตั้งค่า Framework Preset เป็น Next.js โดยอัตโนมัติ

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── data/                    # ข้อมูล Session จัดเก็บในรูปแบบ JSON
├── public/                  # รูปภาพ WebP ทั้งหมด (รูปปั้น, หลักฐาน, เรื่องราว)
│   ├── cards/               # รูปการ์ดหลักฐานและรูปปั้น
│   ├── history_covers/      # ภาพปกประวัติศาสตร์
│   ├── placards/            # ภาพป้ายนิทรรศการ
│   ├── sculptures/          # รูปปั้น 3D จำลอง
│   └── stories/             # ภาพเรื่องราวประวัติศาสตร์
├── src/
│   ├── app/
│   │   ├── api/game/        # REST API สำหรับ Session และ Game Action
│   │   ├── archive/         # หน้ารวมคลังพิพิธภัณฑ์
│   │   ├── teacher/         # แดชบอร์ดผู้คุมเกม (Game Master Dashboard)
│   │   ├── error.tsx        # Client Error Boundary
│   │   ├── layout.tsx       # Root Layout
│   │   └── page.tsx         # หน้าหลักฝั่งผู้เล่น (Student Main App)
│   ├── components/          # React Components ทั้งหมด
│   ├── data/                # Master Game Data & TypeScript Types
│   └── lib/                 # Backend Game State Management
└── package.json
```

---

## 📄 ใบอนุญาต (License)

โปรเจกต์นี้เปิดเผยภายใต้ใบอนุญาต **MIT License** ดูรายละเอียดเพิ่มเติมได้ที่ไฟล์ [LICENSE](./LICENSE)

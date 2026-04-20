# Student Club Management System - Kapsamlı Sistem Analizi

## Proje Özeti

Bu proje, üniversite öğrenci kulüplerinin yönetimini kolaylaştıran web tabanlı bir platformdur. Üye yönetimi, finans, etkinlik organizasyonu, proje/ekip yönetimi ve belge yönetimi modüllerini içermektedir.

---

## Mevcut Dosya Yapısı

```
Club-management-system/
├── app/
│   ├── frontend/                    # React 19 (CRA)
│   │   ├── src/                     # Henüz boş - sadece default CRA
│   │   ├── public/
│   │   ├── package.json             # React 19.2.4
│   │   └── Dockerfile
│   ├── backend/                     # Spring Boot 3.5.13 (Java 21)
│   │   ├── src/main/java/clubms/backend/
│   │   │   ├── BackendApplication.java
│   │   │   └── health/HealthController.java
│   │   └── pom.xml
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
├── diagrams/
│   ├── ER diyagramı.xml             # Veritabanı şeması
│   ├── yapı_diyagramı.drawio.xml    # Sistem modülleri
│   ├── wireframe.html               # UI wireframe'ler
│   ├── vad0/, vad1/, vad2/          # Veri akış diyagramları
│   └── Veri yapıları sözlüğü/
├── docs/
│   ├── system-analysis/             # Gereksinim analizleri (PDF)
│   ├── system-design/
│   └── feasibility-study/           # Fizibilite raporları
└── meeting-reports/                 # Toplantı tutanakları
```

---

## ER Diyagramı - Veritabanı Varlıkları

### Temel Varlıklar (7 adet):

| Varlık | Primary Key | Özellikler |
|--------|-------------|------------|
| **Üye** | ÜyeID | Ad Soyad, Email, Rol |
| **Doküman** | DokümanID | Başlık, Dosya Yolu |
| **Finans** | İşlemID | İşlem Türü, Miktar |
| **Ekip** | EkipID | Ekip Adı |
| **Etkinlik** | EtkinlikID | Etkinlik Adı, Tarih |
| **Proje** | ProjeID | Proje Adı |
| **Görev** | GörevID | Açıklama |

### İlişkiler:
- **Üye → Doküman**: 1-N (Yükler)
- **Üye → Finans**: 1-N (Kaydeder)
- **Üye ↔ Ekip**: M-N (Üyedir)
- **Üye → Ekip**: 1-1 (Yönetir - Ekip Lideri)
- **Üye → Etkinlik**: M-N (Başvurur)
- **Ekip → Proje**: 1-N (Yürütür)
- **Proje → Görev**: 1-N (Kapsar)
- **Üye → Görev**: 1-N (Atanır)

---

## Sistem Modülleri (Yapı Diyagramı)

### 1.0 Finans Modülü
- **1.1** Fiş ve Kayıt İşleme
  - 1.1.1 Fiş Doğrulama
  - 1.1.2 Finans Tablosuna Yazma
- **1.2** Rapor Oluşturma

### 2.0 Üye Kontrol Modülü
- **2.1** Yeni Kayıt İşlemi
  - 2.1.1 Kimlik/İletişim Doğrulama
  - 2.1.2 Üye Tablosuna Ekleme
- **2.2** Üye Görüntüleme ve Güncelleme

### 3.0 Yönetim Modülü
- **3.1** Ekip Kurma ve Lider Atama
- **3.2** Görev Atama
  - 3.2.1 Görev Kaydı Oluşturma
  - 3.2.2 Üyeye Bildirim İletme
- **3.3** Toplantı/Rapor Paylaşımı

### 4.0 Bilgi ve Kaynak Modülü
- **4.1** Belge Yükleme
  - 4.1.1 Format/Boyut Kontrolü
  - 4.1.2 Doküman Tablosuna Kayıt
- **4.2** Yetki Kontrolü ve Onay

### 5.0 Organizasyon Modülü
- **5.1** Etkinlik Oluşturma ve Detay
- **5.2** Duyuru ve Başvuru
  - 5.2.1 Kontenjan Kontrolü
  - 5.2.2 Başvuru Listesine Ekleme

---

## Kullanıcı Rolleri ve Yetkileri (Wireframe'den)

| Rol | Yetkiler |
|-----|----------|
| **Üye** | Profil, Etkinlik başvurusu, Belgeleri görüntüleme |
| **Ekip Üyesi** | + Görevler, Proje detayları, Belge yükleme |
| **Ekip Lideri** | + Ekibi yönetme, Görev atama, Proje oluşturma |
| **Kulüp Başkanı** | + Üye yönetimi, Ekip/lider atama, Finans (F), Tüm belgeler (D) |
| **Sayman** | + Üye yönetimi, Finans (F) |
| **Sekreter** | + Üye yönetimi, Tüm belgeler (D) |

**Flag Sistemi:** Yonetici, Finans (F), Docs (D)

---

## Önerilen Veritabanı Şeması (SQL/Prisma)

### Kullanıcı ve Üyelik Tabloları:

```sql
-- Kullanıcılar (sistem geneli)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Kulüpler
CREATE TABLE clubs (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    logo_url VARCHAR(500),
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Üyelik (user + club ilişkisi)
CREATE TABLE memberships (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    club_id UUID REFERENCES clubs(id),
    role VARCHAR(50) NOT NULL, -- 'uye', 'ekip-uyesi', 'ekip-lideri', 'baskan', 'sayman', 'sekreter'
    flags JSONB, -- {"yonetici": true, "finans": true, "docs": true}
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, inactive
    joined_at TIMESTAMP,
    UNIQUE(user_id, club_id)
);

-- Üye Profilleri
CREATE TABLE member_profiles (
    id UUID PRIMARY KEY,
    membership_id UUID REFERENCES memberships(id),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    department VARCHAR(100),
    class_year INT,
    avatar_url VARCHAR(500)
);
```

### Ekip ve Proje Tabloları:

```sql
-- Ekipler
CREATE TABLE teams (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES memberships(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ekip Üyeliği
CREATE TABLE team_members (
    id UUID PRIMARY KEY,
    team_id UUID REFERENCES teams(id),
    membership_id UUID REFERENCES memberships(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, membership_id)
);

-- Projeler
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id),
    team_id UUID REFERENCES teams(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning', -- planning, active, completed, cancelled
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, critical
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Görevler
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    assigned_to UUID REFERENCES memberships(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
    priority VARCHAR(20) DEFAULT 'normal',
    due_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Etkinlik Tabloları:

```sql
-- Etkinlikler
CREATE TABLE events (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP,
    location VARCHAR(255),
    capacity INT,
    status VARCHAR(50) DEFAULT 'upcoming', -- draft, upcoming, ongoing, completed, cancelled
    created_at TIMESTAMP DEFAULT NOW()
);

-- Etkinlik Başvuruları
CREATE TABLE event_applications (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id),
    membership_id UUID REFERENCES memberships(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    applied_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, membership_id)
);
```

### Finans Tabloları:

```sql
-- Finans İşlemleri
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id),
    type VARCHAR(20) NOT NULL, -- income, expense
    category VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    receipt_url VARCHAR(500),
    transaction_date DATE,
    created_by UUID REFERENCES memberships(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Doküman Tabloları:

```sql
-- Dokümanlar
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id),
    uploaded_by UUID REFERENCES memberships(id),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID REFERENCES memberships(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Backend Mimarisi (Spring Boot)

### Önerilen Paket Yapısı:

```
src/main/java/clubms/backend/
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   └── OpenApiConfig.java
├── controller/
│   ├── AuthController.java
│   ├── ClubController.java
│   ├── MemberController.java
│   ├── TeamController.java
│   ├── ProjectController.java
│   ├── TaskController.java
│   ├── EventController.java
│   ├── FinanceController.java
│   └── DocumentController.java
├── service/
│   ├── AuthService.java
│   ├── ClubService.java
│   ├── MemberService.java
│   └── ...
├── repository/
│   ├── UserRepository.java
│   ├── ClubRepository.java
│   └── ...
├── entity/
│   ├── User.java
│   ├── Club.java
│   ├── Membership.java
│   └── ...
├── dto/
│   ├── request/
│   └── response/
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── UserPrincipal.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   └── ResourceNotFoundException.java
└── util/
```

### Gerekli Bağımlılıklar (pom.xml):

```xml
<!-- JPA/Hibernate -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- PostgreSQL -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- File Upload -->
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.15.1</version>
</dependency>
```

---

## Frontend Mimarisi (React)

### Önerilen Yapı:

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Table.jsx
│   │   └── Modal.jsx
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   └── DashboardLayout.jsx
│   └── forms/
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── ClubRegister.jsx
│   ├── club/
│   │   ├── ClubSelect.jsx
│   │   └── ClubDetail.jsx
│   └── dashboard/
│       ├── Profile.jsx
│       ├── Members.jsx
│       ├── Teams.jsx
│       ├── Projects.jsx
│       ├── Tasks.jsx
│       ├── Events.jsx
│       ├── Finance.jsx
│       └── Documents.jsx
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── clubService.js
│   └── ...
├── store/
│   ├── index.js
│   └── slices/
├── hooks/
├── utils/
└── App.jsx
```

### Önerilen Ek Paketler:

```json
{
  "dependencies": {
    "react-router-dom": "^7.x",
    "@tanstack/react-query": "^5.x",
    "axios": "^1.x",
    "zustand": "^4.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x",
    "lucide-react": "^0.x",
    "tailwindcss": "^3.x",
    "date-fns": "^3.x"
  }
}
```

---

## API Endpoint Taslağı

### Kimlik Doğrulama:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Kulüp:
- `GET /api/clubs` - Kulüpleri listele
- `GET /api/clubs/:id` - Kulüp detayı
- `POST /api/clubs` - Yeni kulüp kaydı
- `GET /api/clubs/my` - Kullanıcının kulüpleri

### Üye Yönetimi:
- `GET /api/clubs/:clubId/members`
- `POST /api/clubs/:clubId/members`
- `PUT /api/clubs/:clubId/members/:id`
- `DELETE /api/clubs/:clubId/members/:id`

### Ekip/Proje/Görev:
- `GET/POST/PUT/DELETE /api/clubs/:clubId/teams`
- `GET/POST/PUT/DELETE /api/clubs/:clubId/projects`
- `GET/POST/PUT/DELETE /api/clubs/:clubId/tasks`

### Etkinlik:
- `GET /api/clubs/:clubId/events`
- `POST /api/clubs/:clubId/events`
- `POST /api/events/:id/apply` - Başvuru
- `PUT /api/events/:id/applications/:appId` - Onay/Red

### Finans:
- `GET /api/clubs/:clubId/transactions`
- `POST /api/clubs/:clubId/transactions`
- `GET /api/clubs/:clubId/transactions/report`

### Doküman:
- `GET /api/clubs/:clubId/documents`
- `POST /api/clubs/:clubId/documents` (multipart)
- `PUT /api/documents/:id/approve`

---

## Docker & Deployment

```yaml
# docker-compose.yml (güncellenmiş)
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: clubms
      POSTGRES_USER: clubms
      POSTGRES_PASSWORD: clubms123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/clubms
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

Bu prompt, projenin mevcut durumunu, tasarım kararlarını ve uygulanması gereken yapıyı kapsamlı şekilde açıklamaktadır.

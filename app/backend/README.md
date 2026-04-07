# Backend

**Sürüm:** 0.0.1-SNAPSHOT

Öğrenci Kulüp Yönetim Sistemi için Spring Boot tabanlı backend API.

**Gereksinimler:**
- Java 21
- spring 3.5.*
- Maven (veya dahil edilen Maven wrapper)

## İndirme ve Kurulum

### Linux

```bash
# backend dizinine geç
cd app/backend

# Maven wrapper ile derle ve çalıştır
./mvnw spring-boot:run

# Ya da önce derleyip, sonra çalıştır
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Windows

```cmd
:: backend dizinine geç
cd app\backend

:: Maven wrapper ile derle ve çalıştır
mvnw.cmd spring-boot:run

:: Ya da önce derleyip, sonra çalıştır
mvnw.cmd clean package
java -jar target\backend-0.0.1-SNAPSHOT.jar
```

API [http://localhost:8080](http://localhost:8080) adresinde çalışacaktır.

## API Uç Noktaları

Backend aşağıdaki REST API uç noktalarını sağlar:
- Üye Yönetimi
- Finans Yönetimi
- Etkinlik Organizasyonu
- Proje & Takım Yönetimi
- Bilgi & Kaynak Yönetimi

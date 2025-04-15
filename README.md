# 🏠 Hot Water Meter Telegram Bot

[//]: # (![Bot Demo Preview]&#40;https://via.placeholder.com/800x400.png?text=Telegram+Bot+Demo&#41;)

A convenient solution for residential buildings to collect and manage hot water meter readings via Telegram, with automatic Google Sheets integration.

## 📸 Bot in Action

<div align="center">
  <img src="./assets/images/bot-screenshot-1.jpg" alt="Пример работы бота" width="250">

*Example of interaction with a bot*
</div>

## ✨ Features

### 📋 Core Functionality
- Automated collection of hot water consumption data
- Data validation (numeric values, ranges, proper formats)

[//]: # (- Support for multiple buildings/sections via configuration)

### ⚙️ Easy Configuration
- **Settings Sheet** for all parameters:
    - Submission deadlines
    - Notification preferences
- No coding required for basic setup

### 🔒 User Management
- Mandatory consent agreement flow
- Telegram ID based authentication
- Session timeout (configured) with resume options

## 📁 Data Structure

### 📊 Spreadsheet Sheets

| Sheet        | Purpose                                                                 | Example Data                                      |
|--------------|-------------------------------------------------------------------------|---------------------------------------------------|
| **Questions** | Stores all user responses                                               | `Full Name`, `Email`, v`Apartment #`, `Hot Water` |
| **Settings**  | Bot configuration and building parameters                               | `Configuration`, `Comands`                        |
| **Logs**     | Action logging (auto-filled)                                            | `2023-11-20 14:30: User123 consents`              |

### Sheet Details:

#### 1. "Questions" Sheet
**Complete Structure:**
| A: Chat_ID | B: Timestamp | C: Telegram_Username | D: Consent | E: Full_Name |
| F: Apartment_No | G: Phone_Number | H: Email | I: Hot_Water_Reading |

**Column Details:**
- **Chat_ID** (Col A): Unique Telegram user identifier
- **Timestamp** (Col B): Auto-updated submission time (`YYYY-MM-DD HH:MM:SS`)
- **Consent** (Col D): `TRUE/FALSE` status of user agreement
- **Hot_Water_Reading** (Col I): Validated numeric value (2 decimal places max)

**Validation Rules:**
```plaintext
● Phone_Number: +7XXXXXXXXXX or 8XXXXXXXXXX  
● Email: Standard email format validation  
● Hot_Water_Reading: Positive number ≤ 9999.99
```

#### 2. "Settings" Sheet

The **"Settings"** sheet controls all bot behavior parameters

### 📋 File Structure
```ini
[Submission]
Deadline_Day = 25       ; Day of month when submissions are due

[Validation]
Min_Water_Reading = 0.5 ; Minimum acceptable value (m³)
Max_Water_Reading = 9999 ; Maximum acceptable value (m³)
Allowed_Apartments = 1-450 ; Valid apartment numbers range

[Texts]
Consent_Link = https://... ; URL to consent document
Welcome_Message = "Добро пожаловать..." ; Initial bot greeting
Error_Message = "Invalid input. Please try again..."
```

## 💬 Need Help?

<div align="center">

![Support Icon](https://img.shields.io/badge/SUPPORT-ACTIVE-brightgreen?style=for-the-badge)

</div>

### 🛠️ Troubleshooting Support
If you encounter any issues or have questions about the bot:

📬 **Contact the maintainer directly**:  
[![Telegram](https://img.shields.io/badge/Message_@sglossu-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/sglossu)

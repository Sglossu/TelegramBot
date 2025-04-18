# 🏠 Hot Water Meter Telegram Bot

[//]: # (![Bot Demo Preview]&#40;https://via.placeholder.com/800x400.png?text=Telegram+Bot+Demo&#41;)

A convenient solution for residential buildings to collect and manage hot water meter readings via Telegram, with automatic Google Sheets integration.

## 📸 Bot in Action

<div align="center">
  <img src="assets/images/screenshot-1.jpg" alt="Пример работы бота" width="250">
  <img src="assets/images/screenshot-2.jpg" alt="Пример работы бота" width="250">

*Example of interaction with a bot*
</div>

## ✨ Features

### 📋 Core Functionality
- Automated collection of hot water consumption data
- Data validation (numeric values, ranges, proper formats)

[//]: # (- Support for multiple buildings/sections via configuration)

### ⚙️ Configuration & Deployment

#### 📁 Project Structure
The bot consists of two separate Google Apps Script projects:

1. **LibrarySheet (Core Library)**
  - Contains all utility functions and core logic
  - Files: All files from `LibrarySheet` folder
  - Deployment: **As a library** via Deployment Manager
  - Versioning: Update library version after significant changes

2. **MainBot (Web App)**
  - Contains only `main.gs` file
  - Must link the deployed LibrarySheet as library
  - Deployment: **As web app** via Deployment Manager

#### 🛠️ Initial Setup
1. **Configure Variables**:
  - Open `config.gs` in LibrarySheet
  - Initialize all required variables (reference `param.gs` for complete list)
  - Example configuration:
    ```javascript
    const CONFIG = {
      TOKEN: 'your_telegram_bot_token_from_BotFather',
      WEBAPP_URL: 'pubic_endpoit_of_your_deployment',
      ...
    };
    ```

2. **Deployment Steps**:
   ```plaintext
   1. Deploy LibrarySheet first (Library type)
   2. Note the library's deployment ID
   3. In MainBot project:
      a. Add LibrarySheet as a library
      b. Deploy as web app (Execute as: Me, Access: Anyone)
   4. Set web app URL as Telegram bot's webhook in config LibrarySheet

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

[//]: # (### Sheet Details:)

[//]: # ()
[//]: # (#### 1. "Questions" Sheet)

[//]: # (**Complete Structure:**)

[//]: # (| A: Chat_ID | B: Timestamp | C: Telegram_Username | D: Consent | E: Full_Name |)

[//]: # (| F: Apartment_No | G: Phone_Number | H: Email | I: Hot_Water_Reading |)

[//]: # ()
[//]: # (**Column Details:**)

[//]: # (- **Chat_ID** &#40;Col A&#41;: Unique Telegram user identifier)

[//]: # (- **Timestamp** &#40;Col B&#41;: Auto-updated submission time &#40;`YYYY-MM-DD HH:MM:SS`&#41;)

[//]: # (- **Consent** &#40;Col D&#41;: `TRUE/FALSE` status of user agreement)

[//]: # (- **Hot_Water_Reading** &#40;Col I&#41;: Validated numeric value &#40;2 decimal places max&#41;)

[//]: # ()
[//]: # (**Validation Rules:**)

[//]: # (```plaintext)

[//]: # (● Phone_Number: +7XXXXXXXXXX or 8XXXXXXXXXX  )

[//]: # (● Email: Standard email format validation  )

[//]: # (● Hot_Water_Reading: Positive number ≤ 9999.99)
[//]: # (```)

[//]: # (#### 2. "Settings" Sheet)

The **"Settings"** sheet controls all bot behavior parameters

[//]: # (### 📋 File Structure)

[//]: # (```ini)

[//]: # ([Submission])

[//]: # (Deadline_Day = 25       ; Day of month when submissions are due)

[//]: # ()
[//]: # ([Validation])

[//]: # (Min_Water_Reading = 0.5 ; Minimum acceptable value &#40;m³&#41;)

[//]: # (Max_Water_Reading = 9999 ; Maximum acceptable value &#40;m³&#41;)

[//]: # (Allowed_Apartments = 1-450 ; Valid apartment numbers range)

[//]: # ()
[//]: # ([Texts])

[//]: # (Consent_Link = https://... ; URL to consent document)

[//]: # (Welcome_Message = "Добро пожаловать..." ; Initial bot greeting)

[//]: # (Error_Message = "Invalid input. Please try again...")

[//]: # (```)

## 💬 Need Help?

📬 **If you encounter any issues or have questions about the bot, contact the maintainer directly**:

[![Telegram](https://img.shields.io/badge/Message_@sglossu-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/sglossu)

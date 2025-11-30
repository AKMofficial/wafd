# Quick Reference: Screenshot Descriptions for Phase 6

This document provides quick copy-paste descriptions for each screenshot. Place each description under the corresponding screenshot in your final document.

---

## Screenshot 1: Login Screen

**Short Description (1-2 lines):**
> Secure authentication screen using JWT tokens. Users log in with email/password to access the system with role-based permissions (Admin, Supervisor, Pilgrim).

**Medium Description (3-4 lines):**
> The Android login screen provides secure authentication using the same JWT-based system as the web application. Users enter credentials which are validated via the backend's `/api/v1/auth/login` endpoint. Supports Admin, Supervisor, and Pilgrim roles with automatic token refresh for seamless session management.

---

## Screenshot 2: Dashboard/Home Screen

**Short Description:**
> Main dashboard displaying real-time statistics: total pilgrims, agencies, halls, and beds. Provides quick navigation to all major system sections.

**Medium Description:**
> Comprehensive overview dashboard fetching data from multiple backend endpoints to display key metrics in a responsive card layout. Features dynamic sizing to prevent overflow, color-coded statistics cards, and quick navigation to Pilgrims, Halls, Agencies, and Settings sections.

---

## Screenshot 3: Pilgrims List Screen

**Short Description:**
> Complete list of all pilgrims with search functionality, status badges, and pagination. Handles null values gracefully with fallback displays.

**Medium Description:**
> Displays comprehensive pilgrim list with search/filter capabilities by name, passport, or registration number. Shows essential information including nationality and status (Expected/Registered/Arrived/Departed). Features pull-to-refresh, efficient pagination, and robust null handling for missing data fields.

---

## Screenshot 4: Pilgrim Details Screen

**Short Description:**
> Detailed pilgrim profile showing personal information, contact details, health status, and accommodation. All fields handle null values with appropriate fallbacks.

**Medium Description:**
> Complete pilgrim information screen displaying full name, age, gender, nationality, passport details, phone number, and special needs indicators. Features edit and delete capabilities (Admin only) with visual status badges. Implements comprehensive null handling with 'N/A' displays for missing backend data.

---

## Screenshot 5: Pilgrim Form Screen (Add/Edit)

**Short Description:**
> Comprehensive form for creating or editing pilgrims with validation, date pickers, dropdown menus, and automatic age calculation from birth date.

**Medium Description:**
> Full-featured pilgrim creation/editing form with input validation, required field indicators (asterisks), Hijri calendar date picker, gender/status dropdowns, and international phone number validation. Features automatic age calculation, group assignment, special needs checkbox, and handles both POST (create) and PUT (update) operations.

---

## Screenshot 6: Halls/Tents List Screen

**Short Description:**
> List of all accommodation halls showing capacity, occupancy, and location. Visual indicators display availability status with color coding.

**Medium Description:**
> Displays all accommodation halls with capacity indicators, current occupancy counts, and location information. Features search/filter functionality, visual progress bars for occupancy percentage, and color-coded status (Green: available, Yellow: partial, Red: full). Provides quick access to create, edit, or view bed diagrams.

---

## Screenshot 7: Hall Details Screen

**Short Description:**
> Detailed hall view with visual bed layout grid, capacity management, and description field. Interactive bed status display shows Available/Occupied/Reserved states.

**Medium Description:**
> Comprehensive hall information screen featuring an interactive bed grid diagram with sequential numbering and real-time status updates. Allows capacity management, location editing, long-text descriptions, and bed assignment by tapping individual beds. Bed status reflects current database state with color-coded visual indicators.

---

## Screenshot 8: Bed Assignment Dialog

**Short Description:**
> Modal dialog for assigning pilgrims to beds with search functionality and validation to prevent double-booking.

**Medium Description:**
> Interactive bed assignment interface with type-ahead pilgrim search by name or registration number. Displays current bed assignment status, prevents double-booking with validation checks, provides instant success/error feedback, and supports undo capability for removing bed assignments.

---

## Screenshot 9: Agencies List Screen

**Short Description:**
> List of all registered travel agencies with contact information, status badges, and pilgrim counts for each agency.

**Medium Description:**
> Displays all agencies (travel companies) managing pilgrim groups, showing name, contact person, email, phone, and operational status. Features status badges (Registered/Arrived/Departed/Cancelled), pilgrim count per agency, supervisor contact details, and search filter functionality.

---

## Screenshot 10: Agency Form Screen

**Short Description:**
> Form for creating/editing agencies with comprehensive validation, required field indicators, and automatic manager account creation.

**Medium Description:**
> Full-featured agency management form with asterisk indicators for required fields, RFC-compliant email validation, international phone format checking, and status dropdown selection. Automatically creates supervisor accounts for agency managers with clear validation messages for each field.

---

## Screenshot 11: Settings/Profile Screen

**Short Description:**
> User settings and system configuration including profile management, language switcher (Arabic/English), and admin tools for user management.

**Medium Description:**
> Comprehensive settings screen featuring profile management with password updates, language toggle for internationalization (i18n), Admin-only user management section, group organization tools, secure logout with token invalidation, and Material Design 3 theme customization options.

---

## One-Line Descriptions (Ultra Short)

Use these for captions or very brief annotations:

1. **Login:** JWT-based authentication with role-based access control
2. **Dashboard:** Real-time statistics overview with quick navigation
3. **Pilgrims List:** Searchable list with status badges and pagination
4. **Pilgrim Details:** Complete profile view with edit/delete capabilities
5. **Pilgrim Form:** Validated input form for creating/editing pilgrims
6. **Halls List:** Accommodation overview with capacity indicators
7. **Hall Details:** Interactive bed grid with assignment management
8. **Bed Assignment:** Pilgrim-to-bed assignment with search and validation
9. **Agencies List:** Travel agency management with status tracking
10. **Agency Form:** Agency creation/editing with manager account setup
11. **Settings:** Profile, language, and system configuration

---

## Technical Descriptions (For Each Screenshot)

If you need to emphasize the technical implementation:

### Login Screen (Technical)
- **Endpoint:** `POST /api/v1/auth/login`
- **Authentication:** JWT token + Refresh token
- **Storage:** Secure storage for token persistence
- **Error Handling:** 401, 403, 500 error codes with user-friendly messages

### Dashboard (Technical)
- **Endpoints:** Multiple GET requests to `/pilgrims/count`, `/agencies/count`, `/tents/count`, `/beds/count`
- **UI:** Wrap widget with SingleChildScrollView for responsive overflow handling
- **Data:** Real-time polling with automatic refresh

### Pilgrims List (Technical)
- **Endpoint:** `GET /api/v1/pilgrims?page=0&size=20&search=<query>`
- **Pagination:** Backend pagination with page/size parameters
- **Null Safety:** All fields nullable with fallback chains (`?? operator`)
- **Authorization:** Requires ADMIN or SUPERVISOR role

### Pilgrim Details (Technical)
- **Endpoints:** `GET /api/v1/pilgrims/{id}`, `DELETE /api/v1/pilgrims/{id}`
- **Data Model:** Nullable fields: String?, int?, DateTime?, Gender?, PilgrimStatus?
- **Critical Fix:** groupId type changed from String to int to match backend Integer

### Pilgrim Form (Technical)
- **Endpoints:** `POST /api/v1/pilgrims` (create), `PUT /api/v1/pilgrims/{id}` (update)
- **Validation:** Regex patterns, required fields, date validation
- **Features:** Auto-calculation of age from birthDate

### Halls List (Technical)
- **Endpoint:** `GET /api/v1/tents`
- **Response:** Array of hall objects with capacity and occupancy data
- **UI:** Progress bars calculated from occupiedBeds/capacity ratio

### Hall Details (Technical)
- **Endpoints:** `GET /api/v1/tents/{id}`, `GET /api/v1/beds/tent/{tentId}`, `PUT /api/v1/tents/{id}`
- **Bed Grid:** Dynamic grid based on capacity
- **New Feature:** Description field added to Tent entity

### Bed Assignment (Technical)
- **Endpoint:** `POST /api/v1/beds/assign`
- **Body:** `{ "bedId": 42, "pilgrimId": 15 }`
- **Validation:** Backend prevents double-booking via database constraints

### Agencies List (Technical)
- **Endpoint:** `GET /api/v1/agencies`
- **Status Enum:** Registered, Arrived, Departed, Cancelled (aligned with backend)
- **Display:** Agency name, contact, status badge, pilgrim count

### Agency Form (Technical)
- **Endpoints:** `POST /api/v1/agencies` (create), `PUT /api/v1/agencies/{id}` (update)
- **Validation:** Email regex, phone format, required fields
- **Side Effect:** Creates supervisor user account on agency creation

### Settings (Technical)
- **Endpoints:** `GET /api/v1/users/me`, `PUT /api/v1/users/{id}`, `GET /api/v1/users`
- **i18n:** Arabic/English language switching
- **Admin Tools:** User management restricted to ADMIN role

---

## Usage Instructions

1. **Place your screenshots** in the `screenshots/` folder with these exact names:
   - login.png
   - dashboard.png
   - pilgrims-list.png
   - pilgrim-details.png
   - pilgrim-form.png
   - halls-list.png
   - hall-details.png
   - bed-assignment.png
   - agencies-list.png
   - agency-form.png
   - settings.png

2. **Choose description length** based on your document format:
   - **Short:** For presentations or slide decks
   - **Medium:** For comprehensive reports
   - **Technical:** For technical documentation or code reviews

3. **Copy-paste** the appropriate description under each screenshot

4. **Customize** as needed to match your professor's requirements

Good luck with your Phase 6 submission! 🚀

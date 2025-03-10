# Advocate Search Project

## Summary of Changes:

### 1. Performance Optimization:

- **Server-Side Search and Filtering:** Moved the search and filtering logic to the server to improve scalability for large datasets. 
- **Pagination & Lazy Loading:** Implemented pagination and lazy loading for the advocate grid to load data progressively as the user scrolls, improving page load speed and resource usage. This improved load time.
- **Introduced Debounced Filtering:** Introduced debounce functionality and ensured proper handling of search input changes to minimize unnecessary API calls and re-renders.
- **Efficient Data Fetching:** Refined how data was fetched by moving API calls to the server-side and using SWR for better data caching and pagination handling.


### 2. UI/UX Enhancements:

- **UI Redesign:** Reimagined the user interface to provide a cleaner, more modern and more intuitive experience, ensuring it was responsive across devices (mobile and desktop).
- **Tag Highlighting:** Improved the search experience by highlighting relevant specialties in the search results and instructing the user on what they can search for.
- **Improved Layout:** Enhanced the layout to optimize user flow, touchability and visibility of important content.

### 3. Code Organization:

- **Type Organization:** Moved the Advocate type into its own file for improved organization and maintainability.

### 4. Database Integration:

- **Database Connection**: Switched from static seed data to dynamic data fetched from the database, enabling a more real-world, scalable application structure.
- **Refactored Specialties:** Switched to a jsonb array for the specialties field to enable easy filtering and searching. This made searching by specialty more efficient and scalable. 

### 5. Bug Fixes and Clean-up:

- Cleaned up environmental configurations, ensuring database connectivity by uncommenting DATABASE_URL in the .env file.


## TODO:

- Separate search and grid components.
- Add branding and colors per Solace color palette.
- Enhance design aesthetics.
- Further analyze and tweak front end performance.
- Add unit or e2e testing.
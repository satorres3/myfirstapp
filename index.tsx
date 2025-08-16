/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Check if the user is logged in. If not, redirect to the login page.
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = '/login.html';
        return; // Stop script execution to prevent errors on a page that will be left
    }

    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Clear the login flag from local storage
            localStorage.removeItem('isLoggedIn');
            // Redirect to the login page
            window.location.href = '/login.html';
        });
    }
});

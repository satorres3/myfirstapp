/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // If the user is already logged in, redirect them to the dashboard.
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = '/';
        return;
    }

    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the default form submission

            // Here you would typically validate credentials with a server.
            // For this example, we'll just simulate a successful login.
            
            // Set a flag in local storage to indicate the user is logged in
            localStorage.setItem('isLoggedIn', 'true');

            // Redirect to the main page (dashboard)
            window.location.href = '/';
        });
    }
});

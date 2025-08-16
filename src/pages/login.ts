export const initLoginPage = (showPage: (page: any) => void) => {
    const googleLoginBtn = document.getElementById('google-login');
    const microsoftLoginBtn = document.getElementById('microsoft-login');
    googleLoginBtn?.addEventListener('click', () => showPage('hub'));
    microsoftLoginBtn?.addEventListener('click', () => showPage('hub'));
};

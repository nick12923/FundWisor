document.addEventListener('DOMContentLoaded', () => {
    // --- API Configuration ---
    const API_BASE_URL = 'http://localhost:3000/api';

    // --- Global State ---
    let state = {
        token: localStorage.getItem('token') || null,
        user: null,
        currentRole: null,
    };

    // --- DOM Elements ---
    const dom = {
        views: document.querySelectorAll('.view'),
        navControls: document.getElementById('nav-controls'),
        brandLogo: document.getElementById('navbar-brand'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        ideaSubmissionForm: document.getElementById('idea-submission-form'),
        homeGetStartedBtn: document.getElementById('home-get-started-btn'),
        showRegisterLink: document.getElementById('show-register-link'),
        showLoginLink: document.getElementById('show-login-link'),
        entrepreneurIdeaList: document.getElementById('entrepreneur-idea-list'),
        investorIdeaList: document.getElementById('investor-idea-list'),
        entrepreneurWelcome: document.getElementById('entrepreneur-welcome'),
        investorWelcome: document.getElementById('investor-welcome'),
    };

    // --- API Service Layer ---
    const api = {
        async register(name, email, password, roles) {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, roles }),
            });
            return res.json();
        },
        async getIdeas() {
            if (!state.token) return [];
            const res = await fetch(`${API_BASE_URL}/ideas`, {
                headers: { 'Authorization': `Bearer ${state.token}` }
            });
            return res.json();
        },
        async submitIdea(title, outline) {
            const res = await fetch(`${API_BASE_URL}/ideas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.token}`
                },
                body: JSON.stringify({ title, outline }),
            });
            return res.json();
        }
    };

    // --- UI Rendering Functions ---
    function showView(viewId) {
        dom.views.forEach(view => view.classList.remove('active'));
        document.getElementById(viewId)?.classList.add('active');
        window.scrollTo(0, 0);
    }

    function updateNav() {
        dom.navControls.innerHTML = '';
        if (state.token && state.user) {
            if (state.user.roles.length > 1) {
                const switchBtn = document.createElement('button');
                switchBtn.className = 'btn btn-secondary';
                const nextRole = state.currentRole === 'entrepreneur' ? 'Investor' : 'Entrepreneur';
                switchBtn.innerText = `View as ${nextRole}`;
                switchBtn.onclick = handleRoleSwitch;
                dom.navControls.appendChild(switchBtn);
            }
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'btn btn-secondary';
            logoutBtn.innerText = 'Logout';
            logoutBtn.onclick = handleLogout;
            dom.navControls.appendChild(logoutBtn);
        } else {
            const loginBtn = document.createElement('button');
            loginBtn.className = 'btn btn-primary';
            loginBtn.innerText = 'Login / Register';
            loginBtn.onclick = () => showView('login-view');
            dom.navControls.appendChild(loginBtn);
        }
    }

    async function renderDashboard() {
        if (!state.token) return;

        const ideas = await api.getIdeas();

        if (state.currentRole === 'entrepreneur') {
            dom.entrepreneurIdeaList.innerHTML = '';
            if (Array.isArray(ideas) && ideas.length > 0) {
                const myIdeas = ideas.filter(idea => idea.owner === state.user.id);
                if (myIdeas.length > 0) {
                    myIdeas.forEach(idea => appendIdeaCard(dom.entrepreneurIdeaList, idea, 'full'));
                } else {
                    dom.entrepreneurIdeaList.innerHTML = '<p>You have not submitted any ideas yet.</p>';
                }
            } else {
                dom.entrepreneurIdeaList.innerHTML = '<p>You have not submitted any ideas yet.</p>';
            }
        }

        if (state.currentRole === 'investor') {
            dom.investorIdeaList.innerHTML = '';
            if (Array.isArray(ideas) && ideas.length > 0) {
                ideas.forEach(idea => appendIdeaCard(dom.investorIdeaList, idea, 'partial'));
            } else {
                dom.investorIdeaList.innerHTML = '<p>No ideas have been submitted to the platform yet.</p>';
            }
        }
    }

    function appendIdeaCard(listElement, idea, type) {
        const card = document.createElement('div');
        card.className = 'idea-card';
        const content = type === 'full'
            ? `<p>${idea.outline}</p><small>Status: <strong>${idea.status}</strong></small>`
            : `<p>${idea.outline}</p><small>Category: <strong>${idea.category}</strong></small>`;

        card.innerHTML = `<h4>${idea.title}</h4>${content}`;
        listElement.appendChild(card);
    }

    // --- Event Handlers ---
    async function handleLogin(e) {
        e.preventDefault();
        const email = dom.loginForm.email.value;
        const password = dom.loginForm.password.value;
        
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await res.json();
            
            if (res.ok && data.token) {
                state.token = data.token;
                localStorage.setItem('token', data.token);
                initializeUserSession();
                dom.loginForm.reset();
            } else {
                alert(`Login Failed: ${data.message || 'Invalid credentials or server error.'}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('A network error occurred. Please try again.');
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        const name = dom.registerForm['register-name'].value;
        const email = dom.registerForm['register-email'].value;
        const password = dom.registerForm['register-password'].value;
        const roles = Array.from(dom.registerForm.querySelectorAll('input[name="roles"]:checked')).map(el => el.value);

        if (roles.length === 0) return alert('Please select at least one role.');

        const data = await api.register(name, email, password, roles);
        if (data.message === 'User registered successfully!') {
            alert(data.message + ' Please log in.');
            dom.registerForm.reset();
            showView('login-view');
        } else {
            alert(`Registration Failed: ${data.message}`);
        }
    }

    async function handleIdeaSubmit(e) {
        e.preventDefault();
        const title = dom.ideaSubmissionForm['idea-title'].value;
        const outline = dom.ideaSubmissionForm['idea-outline'].value;

        const result = await api.submitIdea(title, outline);
        if (result._id) {
            alert('Idea submitted successfully!');
            dom.ideaSubmissionForm.reset();
            renderDashboard();
        } else {
            alert(`Submission failed: ${result.message}`);
        }
    }

    function handleLogout() {
        state.token = null;
        state.user = null;
        state.currentRole = null;
        localStorage.removeItem('token');
        dom.loginForm.reset();
        showView('home-view');
        updateNav();
    }

    function handleRoleSwitch() {
        state.currentRole = state.currentRole === 'entrepreneur' ? 'investor' : 'entrepreneur';
        showView(`${state.currentRole}-dashboard-view`);
        renderDashboard();
        updateNav();
    }

    function initializeUserSession() {
        if (state.token) {
            try {
                const payload = JSON.parse(atob(state.token.split('.')[1]));
                state.user = { roles: payload.roles, name: payload.name, id: payload.id };
                state.currentRole = state.user.roles[0];
                
                dom.entrepreneurWelcome.innerText = `Welcome, ${state.user.name}!`;
                dom.investorWelcome.innerText = `Welcome, ${state.user.name}!`;
                
                showView(`${state.currentRole}-dashboard-view`);
                renderDashboard();
            } catch (e) {
                console.error("Invalid token:", e);
                handleLogout();
            }
        } else {
            showView('home-view');
        }
        updateNav();
    }

    // --- Event Listeners ---
    dom.loginForm.addEventListener('submit', handleLogin);
    dom.registerForm.addEventListener('submit', handleRegister);
    dom.ideaSubmissionForm.addEventListener('submit', handleIdeaSubmit);
    dom.homeGetStartedBtn.addEventListener('click', () => showView('login-view'));
    dom.showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showView('register-view'); });
    dom.showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showView('login-view'); });
    dom.brandLogo.addEventListener('click', () => {
        const view = state.token ? `${state.currentRole}-dashboard-view` : 'home-view';
        showView(view);
    });

    // --- Initial Load ---
    initializeUserSession();
});
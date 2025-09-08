// --- UI Element Selectors ---
const homePage = document.getElementById('home-page');
const registerPage = document.getElementById('register-page');
const votePage = document.getElementById('vote-page');
const resultPage = document.getElementById('result-page');
const registrationSuccessPage = document.getElementById('registration-success-page');
const voteSuccessPage = document.getElementById('vote-success-page');

const registerButton = document.getElementById('register-button');
const voteButton = document.getElementById('vote-button');
const resultButton = document.getElementById('result-button');
const submitRegistrationButton = document.getElementById('submit-registration');
const continueToLoginLink = document.getElementById('continue-to-login');
const continueToResultsLink = document.getElementById('continue-to-results');
const resultsTableBody = document.getElementById('results-table-body');
const messageModal = document.getElementById('message-modal');
const modalText = document.getElementById('modal-text');
const modalCloseButton = document.getElementById('modal-close-button');

const authContainer = document.getElementById('auth-container');
const votingContainer = document.getElementById('voting-container');
const candidateRows = document.querySelectorAll('.candidate-row');
const voterIdInput = document.getElementById('voterId');
const nameInput = document.getElementById('name');
const dobInput = document.getElementById('dob');
const phoneNumberInput = document.getElementById('phoneNumber');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const voterIdAuthInput = document.getElementById('voterIdAuth');
const passwordAuthInput = document.getElementById('passwordAuth');
const submitAuthButton = document.getElementById('submit-auth');
const submitVoteButton = document.getElementById('submit-vote');
const passwordToggleReg = document.getElementById('password-toggle-reg');
const passwordToggleConfirmReg = document.getElementById('password-toggle-confirm-reg');
const passwordToggleAuth = document.getElementById('password-toggle-auth');

// --- App State ---
const USERS_KEY = 'voter_users';
const VOTES_KEY = 'voter_votes';
const candidates = {
    '1': 'DMK Party',
    '2': 'ADMK Party',
    '3': 'TVK Party',
    '4': 'BJP  PARTY',
    '5': 'N.O.T.A'
};

// --- Helper Functions ---
const showModal = (message) => {
    modalText.textContent = message;
    messageModal.classList.remove('hidden');
};

const hideModal = () => {
    messageModal.classList.add('hidden');
};

const showPage = (pageId) => {
    homePage.classList.add('hidden');
    registerPage.classList.add('hidden');
    votePage.classList.add('hidden');
    resultPage.classList.add('hidden');
    registrationSuccessPage.classList.add('hidden');
    voteSuccessPage.classList.add('hidden');
    document.getElementById(pageId).classList.remove('hidden');
};

const loadData = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error loading data from localStorage:", e);
        return [];
    }
};

const saveData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Error saving data to localStorage:", e);
    }
};

const checkUserStatus = () => {
    const registeredUsers = loadData(USERS_KEY);
    const voterId = voterIdAuthInput.value;
    return registeredUsers.find(user => user.voterId === voterId);
};

const getResults = () => {
    const votes = loadData(VOTES_KEY);
    const voteCounts = {};
    for (const key in candidates) {
        voteCounts[key] = 0;
    }

    votes.forEach(vote => {
        const option = vote.option;
        if (voteCounts.hasOwnProperty(option)) {
            voteCounts[option]++;
        }
    });

    resultsTableBody.innerHTML = '';
    for (const key in voteCounts) {
        const row = document.createElement('tr');
        row.className = "border-b border-gray-200";
        row.innerHTML = `
            <td class="p-2">${key}</td>
            <td class="p-2">${candidates[key]}</td>
            <td class="p-2">${voteCounts[key]}</td>
        `;
        resultsTableBody.appendChild(row);
    }
};

// --- Event Listeners ---
const navRegister = document.getElementById('nav-register');
const navVote = document.getElementById('nav-vote');
const navResult = document.getElementById('nav-result');

navRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('register-page');
});

navVote.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('vote-page');
    authContainer.classList.remove('hidden');
    votingContainer.classList.add('hidden');
});

navResult.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('result-page');
    getResults();
});

registerButton.addEventListener('click', () => showPage('register-page'));
voteButton.addEventListener('click', () => {
    showPage('vote-page');
    authContainer.classList.remove('hidden');
    votingContainer.classList.add('hidden');
});
resultButton.addEventListener('click', () => {
    showPage('result-page');
    getResults();
});

continueToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('home-page');
});

continueToResultsLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('result-page');
    getResults();
});

modalCloseButton.addEventListener('click', hideModal);

submitRegistrationButton.addEventListener('click', () => {
    const name = nameInput.value;
    const dob = dobInput.value;
    const voterId = voterIdInput.value;
    const phoneNumber = phoneNumberInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!name || !dob || !voterId || !phoneNumber || !password || !confirmPassword) {
        showModal("Please fill in all the required fields.");
        return;
    }

    if (password !== confirmPassword) {
        showModal("Passwords do not match. Please try again.");
        return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (password.length < 8 || !hasUppercase || !hasLowercase || !hasDigit || !hasSymbol) {
        showModal("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol.");
        return;
    }

    const registeredUsers = loadData(USERS_KEY);
    if (registeredUsers.find(user => user.voterId === voterId)) {
        showModal("Voter ID already registered. Please use a different one or authenticate to vote.");
        return;
    }

    const newUser = { name, dob, voterId, phoneNumber, password, hasVoted: false };
    registeredUsers.push(newUser);
    saveData(USERS_KEY, registeredUsers);

    showPage('registration-success-page');
});

submitAuthButton.addEventListener('click', () => {
    const voterId = voterIdAuthInput.value;
    const password = passwordAuthInput.value;
    const user = checkUserStatus();

    if (!user || user.password !== password) {
        showModal("Invalid Voter ID or password. Please try again.");
        return;
    }

    if (user.hasVoted) {
        showModal("You have already voted.");
        return;
    }

    authContainer.classList.add('hidden');
    votingContainer.classList.remove('hidden');
});

let selectedCandidate = null;

candidateRows.forEach(row => {
    row.addEventListener('click', () => {
        candidateRows.forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        selectedCandidate = row.dataset.option;
    });
});

submitVoteButton.addEventListener('click', () => {
    if (!selectedCandidate) {
        showModal("Please select a candidate to vote.");
        return;
    }

    const voterId = voterIdAuthInput.value;
    const registeredUsers = loadData(USERS_KEY);
    const userIndex = registeredUsers.findIndex(user => user.voterId === voterId);

    if (userIndex === -1) {
        showModal("Authentication failed. Please try again.");
        return;
    }

    if (registeredUsers[userIndex].hasVoted) {
        showModal("You have already voted.");
        return;
    }

    const votes = loadData(VOTES_KEY);
    votes.push({ voterId, option: selectedCandidate, timestamp: new Date().toISOString() });
    saveData(VOTES_KEY, votes);

    registeredUsers[userIndex].hasVoted = true;
    saveData(USERS_KEY, registeredUsers);

    showPage('vote-success-page');
    getResults(); // Refresh results table
});

// Password visibility toggles
passwordToggleReg.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
});

passwordToggleConfirmReg.addEventListener('click', () => {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
});

passwordToggleAuth.addEventListener('click', () => {
    const type = passwordAuthInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordAuthInput.setAttribute('type', type);
});

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
    showPage('home-page');
});

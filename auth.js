class AuthManager {
    constructor() {
        this.token = null;
        this.user = JSON.parse(localStorage.getItem('authUser') || 'null');
        
        // Listen to Firebase Auth state changes
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.token = user.uid;
            } else {
                this.token = null;
                this.user = null;
                localStorage.removeItem('authUser');
                if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
                    window.location.href = 'login.html';
                }
            }
        });
    }

    async register(email, password, role, year, section) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            const isAdmin = email.toLowerCase() === 'admin@mrcet.edu';
            const finalRole = isAdmin ? 'admin' : role;
            const isApproved = isAdmin;

            // Save the user metadata to Firestore
            await db.collection('users').doc(user.uid).set({
                email: email,
                role: finalRole,
                year: (isAdmin || role === 'faculty') ? null : year,
                section: (isAdmin || role === 'faculty') ? null : section,
                isApproved: isApproved,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.user = { email: user.email, role: finalRole, uid: user.uid, year: year, section: section, isApproved: isApproved };
            localStorage.setItem('authUser', JSON.stringify(this.user));
            return this.user;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Fetch metadata from Firestore
            const doc = await db.collection('users').doc(user.uid).get();
            const data = doc.exists ? doc.data() : {};
            const role = data.role || 'student';
            const isApproved = data.hasOwnProperty('isApproved') ? data.isApproved : (role === 'admin');

            this.user = { 
                email: user.email, 
                role: role, 
                uid: user.uid,
                year: data.year || null,
                section: data.section || null,
                isApproved: isApproved 
            };
            localStorage.setItem('authUser', JSON.stringify(this.user));
            return this.user;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async logout() {
        await auth.signOut();
    }

    isAuthenticated() {
        return !!this.user;
    }
}

const authManager = new AuthManager();

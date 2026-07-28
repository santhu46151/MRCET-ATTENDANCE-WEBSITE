// Cloud Firestore helper methods
const firestoreManager = {
  getUserData(uid) {
    return db.collection('users').doc(uid).get().then(doc => doc.exists ? doc.data() : null);
  },

  saveUserData(uid, data) {
    return db.collection('users').doc(uid).set({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }
};

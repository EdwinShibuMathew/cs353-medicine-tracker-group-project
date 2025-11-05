const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, push } = require("firebase/database");
require('dotenv').config();

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function addNewMedicine(name, brand, countryOfOrigin, allergens) {
    const db = getDatabase(app);
    const medicalDatabaseRef = ref(db, 'medicalDatabase');
    const newMedicineRef = push(medicalDatabaseRef);
    set(newMedicineRef, {
        name: name,
        brand: brand,
        countryOfOrigin: countryOfOrigin,
        allergens: allergens
    });
}

function getMedicineBrand(medID) {
  const database = getDatabase(app);
  const brandRef = ref(database, 'medicalDatabase/' + medID + '/brand');
  onValue(brandRef, (snapshot) => {
    const data = snapshot.val();
    console.log(data);
    return data;
  });
}

addNewMedicine("Ibuprofen", "SomeTotallyVeryUniqueBrand", "Ireland", ["ibuprofen"]);
console.log("i think i added ibuprofen yipee");
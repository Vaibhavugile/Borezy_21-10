// File: updateBranchIds.js

import { getDocs, collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Adjust path as needed

const updateBranchDocumentIds = async () => {
  try {
    const branchesCollection = collection(db, 'branches');
    const branchSnapshot = await getDocs(branchesCollection);

    for (const branchDoc of branchSnapshot.docs) {
      const branchData = branchDoc.data();
      const branchCode = branchData.branchCode;

      if (branchCode) {
        // Create a new document with branchCode as the ID
        const newBranchRef = doc(db, 'branches', branchCode);
        await setDoc(newBranchRef, branchData);

        // Delete the old document
        await deleteDoc(branchDoc.ref);

        console.log(`Updated document ID to ${branchCode}`);
      } else {
        console.log(`Branch code not found for document ${branchDoc.id}`);
      }
    }

    console.log('Branch document IDs updated successfully.');
  } catch (error) {
    console.error('Error updating branch document IDs:', error);
  }
};

updateBranchDocumentIds();

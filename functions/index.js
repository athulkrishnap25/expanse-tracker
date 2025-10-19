const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// This function triggers whenever a new document is created in the 'sales' collection
exports.updateStockOnSale = functions.firestore
  .document("sales/{saleId}")
  .onCreate(async (snap, context) => {
    // Get the data from the newly created sale document
    const saleData = snap.data();
    const itemsSold = saleData.items;

    if (!itemsSold || itemsSold.length === 0) {
      console.log("No items in this sale to update stock for.");
      return null;
    }

    const batch = db.batch();

    // Loop through each item in the sale
    itemsSold.forEach((item) => {
      const productRef = db.collection("products").doc(item.id);
      // We use Firestore's FieldValue to decrement the stock quantity safely
      const decrement = admin.firestore.FieldValue.increment(-item.quantity);
      
      batch.update(productRef, { stockQuantity: decrement });
    });

    // Commit all the updates at once
    try {
      await batch.commit();
      console.log("Stock levels updated successfully.");
      return null;
    } catch (error) {
      console.error("Error updating stock levels:", error);
      return null;
    }
  });
// Placeholder for price updater script
import Asset from "../src/models/Asset";

async function updatePrices() {
  // Simulate price updates
  const assets = await Asset.find();
  for (const asset of assets) {
    const newPrice = asset.currentPrice * (0.95 + Math.random() * 0.1); // Random change
    await Asset.findByIdAndUpdate(asset._id, {
      currentPrice: newPrice,
      lastUpdated: new Date(),
    });
  }
  console.log("Prices updated");
}

setInterval(updatePrices, 60000); // Update every minute

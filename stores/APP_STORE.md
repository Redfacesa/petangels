# Pet Angels SA — App Store & Play Store

Package ID: `za.co.petangelssa.app`  
Name: **Pet Angels SA**  
Privacy: https://app.petangelssa.co.za/legal  
Support: https://app.petangelssa.co.za/  
Marketing: https://petangelssa.co.za/

The stores wrap the same product as the website (Capacitor). Icons live in `resources/` and `public/icons/`.

## One-time on a Mac with Node, Xcode, and Android Studio

```bash
npm install
npm run native:init
npx cap sync
npx cap open ios
npx cap open android
```

If `ios` or `android` folders already exist, use `npm run native:sync` instead of `native:init`.

### After `cap add ios`

In Xcode → Signing & Capabilities: your Apple Team, bundle `za.co.petangelssa.app`.

Info.plist keys to add:

- `ITSAppUsesNonExemptEncryption` = `NO` (unless you add custom crypto)
- `NSPhotoLibraryUsageDescription` = `Pet Angels uses your photo library so you can add pet and story photos.`
- `NSCameraUsageDescription` = `Pet Angels uses the camera so you can photograph pets and posts.`
- Associated Domains: `applinks:app.petangelssa.co.za`

Replace `TEAMID` in `public/.well-known/apple-app-site-association` with your Apple Team ID, then redeploy the website.

### After `cap add android`

Android Studio → Generate Signed Bundle / APK → Play **AAB**.

targetSdk 35, minSdk Capacitor default (24+).

Put the Play App Signing SHA-256 into `public/.well-known/assetlinks.json` and redeploy.

## Store listing copy

**Subtitle / short:** South Africa’s community for pets, rescues and shops.

**Description:**
Pet Angels SA is where pet parents, shelters and businesses live together. Share stories, find care, shop for products (never animals), report lost pets, and use the live Shelter Map. Adoption stays with verified rescues. Payments go through RedFace Pay and Paystack.

**Keywords (iOS):** pets, rescue, adoption, south africa, dogs, cats, shelter

**Category:** Social / Lifestyle  
**Age:** 13+

## Screenshots

Use the live app on an iPhone 15 and a Pixel-class Android. Capture: Home, a story, Discover, Rescue / map, Profile. No test accounts with fake card numbers in shot.

Play also needs a 1024×500 feature graphic (forest `#2F5D50` + logo). App icon 1024 is `public/icons/icon-1024.png`.

## Review notes for Apple / Google

- Animals cannot be sold as products.
- Checkout opens in the system/in-app browser (RedFace Pay / Paystack), not a custom card form.
- Web ads (AdSense) are off inside the native shells.
- Account deletion: posts can be deleted in-app; full account deletion via legal/privacy contact.

## Version

App version in `package.json` is `1.0.0`. Bump it for each store upload, then `npm run native:sync`.

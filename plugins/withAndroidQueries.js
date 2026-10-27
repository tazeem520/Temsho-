const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidQueries(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Ensure queries array exists
    if (!androidManifest.queries) {
      androidManifest.queries = [];
    }

    const queriesObj = androidManifest.queries[0] || {};
    const intentList = queriesObj.intent || [];
    const packageList = queriesObj.package || [];

    // Add intent filters for UPI payment schemes
    const schemes = ['upi', 'phonepe', 'tez', 'gpay', 'paytmmp', 'credpay', 'bhim', 'mobikwik'];
    schemes.forEach((scheme) => {
      intentList.push({
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        data: [{ $: { 'android:scheme': scheme } }],
      });
    });

    // Add package visibility for all major Indian UPI applications
    const packages = [
      'com.phonepe.app',
      'com.google.android.apps.nbu.paisa.user',
      'net.one97.paytm',
      'in.org.npci.upiapp',
      'com.dreamplug.androidapp',
      'com.mobikwik_new',
      'com.freecharge.android',
      'com.whatsapp',
      'in.amazon.mShop.android.shopping',
    ];

    packages.forEach((pkg) => {
      packageList.push({
        $: { 'android:name': pkg },
      });
    });

    queriesObj.intent = intentList;
    queriesObj.package = packageList;
    androidManifest.queries = [queriesObj];

    return config;
  });
};

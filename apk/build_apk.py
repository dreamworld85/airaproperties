import zipfile
def safe_copy(src, dst):
    try:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(src, 'rb') as fsrc:
            data = fsrc.read()
        with open(dst, 'wb') as fdst:
            fdst.write(data)
        print(f'Copied to {dst}')
    except Exception as e:
        print(f'Warning copying to {dst}: {e}')
import os
import sys
import subprocess
import shutil

# Ensure user site-packages is in sys.path
user_site = os.path.expanduser("~\\AppData\\Roaming\\Python\\Python313\\site-packages")
if user_site not in sys.path:
    sys.path.append(user_site)

try:
    from PIL import Image
except ImportError:
    print("Pillow not found, installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    if user_site not in sys.path:
        sys.path.append(user_site)
    import site
    from importlib import reload
    reload(site)
    from PIL import Image

ANDROID_SDK_PATH = "C:\\Users\\prave\\AppData\\Local\\Android\\Sdk"
JAVA_HOME_PATH = "C:\\Program Files\\Android\\Android Studio\\jbr"
GRADLE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "gradle-8.5", "bin", "gradle.bat"))
KEYSTORE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "release.keystore"))

def ensure_keystore(keystore_path):
    if os.path.exists(keystore_path):
        print(f"Using existing release keystore: {keystore_path}")
        return True
    keytool_bin = os.path.join(JAVA_HOME_PATH, "bin", "keytool.exe")
    if not os.path.exists(keytool_bin):
        keytool_bin = "keytool"
    cmd = [
        keytool_bin, "-genkey", "-v",
        "-keystore", keystore_path,
        "-alias", "airaproperties",
        "-keyalg", "RSA",
        "-keysize", "2048",
        "-validity", "10000",
        "-storepass", "aira2026",
        "-keypass", "aira2026",
        "-dname", "CN=Aira Properties, OU=Mobile, O=Aira Properties, L=Kochi, ST=Kerala, C=IN"
    ]
    try:
        subprocess.check_call(cmd)
        print(f"Generated release keystore at {keystore_path}")
        return True
    except Exception as e:
        print(f"Warning: Could not generate release keystore ({e}). Will build debug.")
        return False

def create_android_project(project_dir, app_name, app_url, package_name, icon_src):
    print(f"Creating Android project for {app_name}...")
    
    # Create directories
    java_dir = os.path.join(project_dir, "app", "src", "main", "java", *package_name.split("."))
    res_dir = os.path.join(project_dir, "app", "src", "main", "res")
    os.makedirs(java_dir, exist_ok=True)
    os.makedirs(res_dir, exist_ok=True)

    # Copy release keystore into app/ directory
    if os.path.exists(KEYSTORE_PATH):
        shutil.copy(KEYSTORE_PATH, os.path.join(project_dir, "app", "release.keystore"))

    # Copy google-services.json into app/ directory
    google_services_path = os.path.join(os.path.dirname(__file__), "google-services.json")
    if os.path.exists(google_services_path):
        shutil.copy(google_services_path, os.path.join(project_dir, "app", "google-services.json"))

    # 1. settings.gradle
    settings_template = """
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "{app_name_clean}"
include ':app'
"""
    with open(os.path.join(project_dir, "settings.gradle"), "w") as f:
        f.write(settings_template.replace("{app_name_clean}", app_name.replace(' ', '')))

    # 2. build.gradle (project)
    with open(os.path.join(project_dir, "build.gradle"), "w") as f:
        f.write("""
plugins {
    id 'com.android.application' version '8.2.2' apply false
    id 'com.google.gms.google-services' version '4.4.1' apply false
}
""")

    # 3. local.properties
    with open(os.path.join(project_dir, "local.properties"), "w") as f:
        sdk_escaped = ANDROID_SDK_PATH.replace("\\", "\\\\").replace(":", "\\:")
        f.write(f"sdk.dir={sdk_escaped}\n")

    # 3.5 gradle.properties
    with open(os.path.join(project_dir, "gradle.properties"), "w") as f:
        f.write("android.useAndroidX=true\n")
        f.write("android.suppressUnsupportedCompileSdk=36\n")

    # 4. app/build.gradle
    app_gradle_template = """
plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services'
}

android {
    namespace '{package_name}'
    compileSdk 36

    defaultConfig {
        applicationId '{package_name}'
        minSdk 24
        targetSdk 36
        versionCode 6
        versionName "1.2.3"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        release {
            storeFile file('release.keystore')
            storePassword 'aira2026'
            keyAlias 'airaproperties'
            keyPassword 'aira2026'
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            signingConfig signingConfigs.release
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            signingConfig signingConfigs.release
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation platform('com.google.firebase:firebase-bom:32.8.0')
    implementation 'com.google.firebase:firebase-messaging'
}
"""
    with open(os.path.join(project_dir, "app", "build.gradle"), "w") as f:
        f.write(app_gradle_template.replace("{package_name}", package_name))

    # 5. Manifest with Full Native FCM Push Notification Support
    manifest_template = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:label="{app_name}"
        android:supportsRtl="true"
        android:theme="@style/Theme.App"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.App.NoActionBar"
            android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Native Firebase Cloud Messaging Service for Instant Alerts -->
        <service
            android:name=".AiraFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@mipmap/ic_launcher" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_color"
            android:resource="@color/ink" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="aira_properties_alerts" />
    </application>
</manifest>
"""
    with open(os.path.join(project_dir, "app", "src", "main", "AndroidManifest.xml"), "w") as f:
        f.write(manifest_template.replace("{app_name}", app_name))

    # 6. Colors and Themes
    values_dir = os.path.join(res_dir, "values")
    os.makedirs(values_dir, exist_ok=True)
    with open(os.path.join(values_dir, "colors.xml"), "w") as f:
        f.write("""<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ink">#0F3D3E</color>
    <color name="cream">#FAF8F3</color>
</resources>
""")

    with open(os.path.join(values_dir, "themes.xml"), "w") as f:
        f.write("""<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.App" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">@color/ink</item>
    </style>
    <style name="Theme.App.NoActionBar" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">@color/ink</item>
    </style>
</resources>
""")

# 7. MainActivity.java with Native FCM Push Notification Support
    java_template = """package {package_name};

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.os.Build;
import android.Manifest;
import android.content.pm.PackageManager;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.ValueCallback;
import android.webkit.SslErrorHandler;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.net.http.SslError;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.content.ClipData;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.util.Log;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "AiraMainActivity";
    private WebView mWebView;
    private ValueCallback<Uri[]> mUploadMessage;
    private final static int REQUEST_SELECT_FILE = 100;
    private final static int REQUEST_NOTIFICATION_PERMISSION = 101;
    private String mNativeFcmToken = null;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 1. Setup Notification Channel
        createNotificationChannel();

        SharedPreferences prefs = getSharedPreferences("aira_fcm_prefs", Context.MODE_PRIVATE);
        mNativeFcmToken = prefs.getString("fcm_token", null);

        // 2. Auto-request Android 13+ Notification Runtime Permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQUEST_NOTIFICATION_PERMISSION);
            }
        }

        // 3. Initialize Native FCM and Subscribe to "all_users"
        initNativeFCM();

        mWebView = new WebView(this);
        mWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        setContentView(mWebView);

        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setSupportZoom(false);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setLoadsImagesAutomatically(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            webSettings.setOffscreenPreRaster(true);
        }

        // Enable session persistence and third-party cookies for seamless auth
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(mWebView, true);
        }

        // Clean user agent so Google and social OAuth logins work seamlessly without rejection
        String defaultUa = webSettings.getUserAgentString();
        if (defaultUa != null && defaultUa.contains("; wv")) {
            webSettings.setUserAgentString(defaultUa.replace("; wv", ""));
        }

        // Add JavaScript Interface for Native-Web communication
        mWebView.addJavascriptInterface(new AiraNativeBridge(), "AiraNativeApp");

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.proceed();
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                CookieManager.getInstance().flush();
                // Inject native FCM token into web app so it knows push is active
                if (mNativeFcmToken != null) {
                    mWebView.evaluateJavascript("window.__AIRA_NATIVE_FCM_TOKEN = '" + mNativeFcmToken + "';", null);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request == null || request.getUrl() == null) return false;
                return handleCustomUrl(view, request.getUrl().toString());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleCustomUrl(view, url);
            }

            private boolean handleCustomUrl(WebView view, String url) {
                if (url == null) return false;

                // 1. Correctly handle intent:// scheme (e.g. Google Maps redirect)
                if (url.startsWith("intent:")) {
                    try {
                        Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                        if (intent != null) {
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            PackageManager pm = view.getContext().getPackageManager();
                            if (intent.resolveActivity(pm) != null) {
                                view.getContext().startActivity(intent);
                                return true;
                            }
                            String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                            if (fallbackUrl != null && !fallbackUrl.isEmpty()) {
                                view.loadUrl(fallbackUrl);
                                return true;
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error handling intent scheme: " + e.getMessage());
                    }
                    return true;
                }

                // 2. Handle Google Maps, Navigation, Geo, Tel, Mail, WhatsApp, Market schemes
                if (url.startsWith("geo:") || url.startsWith("tel:") || url.startsWith("mailto:") ||
                    url.startsWith("sms:") || url.startsWith("whatsapp:") || url.contains("wa.me") ||
                    url.startsWith("market:") || url.contains("maps.google.com") || url.contains("google.com/maps")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        view.getContext().startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Log.e(TAG, "Error opening external application for " + url + ": " + e.getMessage());
                        return false;
                    }
                }

                return false;
            }
        });

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (mUploadMessage != null) {
                    mUploadMessage.onReceiveValue(null);
                }
                mUploadMessage = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, REQUEST_SELECT_FILE);
                } catch (Exception e) {
                    mUploadMessage = null;
                    return false;
                }
                return true;
            }
        });

        // Handle target URL from notification click
        String targetUrl = "{app_url}";
        if (getIntent() != null && getIntent().hasExtra("target_url")) {
            String extraUrl = getIntent().getStringExtra("target_url");
            if (extraUrl != null && !extraUrl.isEmpty()) {
                targetUrl = extraUrl;
            }
        }

        if (savedInstanceState == null) {
            mWebView.loadUrl(targetUrl);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Aira Properties Alerts";
            String description = "Instant property updates, alerts, and offers";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel("aira_properties_alerts", name, importance);
            channel.setDescription(description);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 250, 250, 250});
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void initNativeFCM() {
        try {
            // Subscribe device to all_users topic
            FirebaseMessaging.getInstance().subscribeToTopic("all_users");
            
            // Fetch native token and send to server
            FirebaseMessaging.getInstance().getToken().addOnCompleteListener(task -> {
                if (!task.isSuccessful()) {
                    Log.w(TAG, "Fetching FCM registration token failed", task.getException());
                    return;
                }
                mNativeFcmToken = task.getResult();
                Log.d(TAG, "Native FCM Registration Token: " + mNativeFcmToken);
                SharedPreferences fcmPrefs = getSharedPreferences("aira_fcm_prefs", Context.MODE_PRIVATE);
                fcmPrefs.edit().putString("fcm_token", mNativeFcmToken).apply();

                FCMRegistrationHelper.sendTokenToServer(MainActivity.this, mNativeFcmToken, null);

                if (mWebView != null) {
                    mWebView.post(() -> {
                        mWebView.evaluateJavascript("window.__AIRA_NATIVE_FCM_TOKEN = '" + mNativeFcmToken + "';", null);
                    });
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error initializing Native FCM: " + e.getMessage());
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent != null && intent.hasExtra("target_url")) {
            String url = intent.getStringExtra("target_url");
            if (url != null && !url.isEmpty() && mWebView != null) {
                mWebView.loadUrl(url);
            }
        }
    }

    public class AiraNativeBridge {
        @JavascriptInterface
        public String getNativeFcmToken() {
            if (mNativeFcmToken == null) {
                SharedPreferences fcmPrefs = getSharedPreferences("aira_fcm_prefs", Context.MODE_PRIVATE);
                mNativeFcmToken = fcmPrefs.getString("fcm_token", null);
            }
            return mNativeFcmToken;
        }

        @JavascriptInterface
        public void subscribeDistrict(String district) {
            if (district != null && !district.isEmpty()) {
                String clean = district.trim().toLowerCase().replaceAll("[^a-z0-9]", "_");
                FirebaseMessaging.getInstance().subscribeToTopic("district_" + clean);
                if (mNativeFcmToken == null) {
                    SharedPreferences fcmPrefs = getSharedPreferences("aira_fcm_prefs", Context.MODE_PRIVATE);
                    mNativeFcmToken = fcmPrefs.getString("fcm_token", null);
                }
                if (mNativeFcmToken != null) {
                    FCMRegistrationHelper.sendTokenToServer(MainActivity.this, mNativeFcmToken, district);
                }
            }
        }

        @JavascriptInterface
        public void registerUser(String userId, String district) {
            if (mNativeFcmToken == null) {
                SharedPreferences fcmPrefs = getSharedPreferences("aira_fcm_prefs", Context.MODE_PRIVATE);
                mNativeFcmToken = fcmPrefs.getString("fcm_token", null);
            }
            if (mNativeFcmToken != null) {
                FCMRegistrationHelper.sendTokenToServer(MainActivity.this, mNativeFcmToken, district, userId);
            }
        }

        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }

        @JavascriptInterface
        public void openDirections(double lat, double lng, String label) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Uri uri = Uri.parse("https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng);
                        Intent mapIntent = new Intent(Intent.ACTION_VIEW, uri);
                        mapIntent.setPackage("com.google.android.apps.maps");
                        mapIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        if (mapIntent.resolveActivity(getPackageManager()) != null) {
                            startActivity(mapIntent);
                        } else {
                            Intent genericIntent = new Intent(Intent.ACTION_VIEW, uri);
                            genericIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(genericIntent);
                        }
                    } catch (Exception e) {
                        try {
                            Intent fallback = new Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng));
                            fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(fallback);
                        } catch (Exception ignored) {}
                    }
                }
            });
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_SELECT_FILE) {
            if (mUploadMessage == null) return;
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                String dataString = data.getDataString();
                ClipData clipData = data.getClipData();
                if (clipData != null) {
                    results = new Uri[clipData.getItemCount()];
                    for (int i = 0; i < clipData.getItemCount(); i++) {
                        results[i] = clipData.getItemAt(i).getUri();
                    }
                } else if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
            mUploadMessage.onReceiveValue(results);
            mUploadMessage = null;
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_NOTIFICATION_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d(TAG, "Notification permission GRANTED by user");
                initNativeFCM();
            } else {
                Log.w(TAG, "Notification permission DENIED by user");
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
"""
    with open(os.path.join(java_dir, "MainActivity.java"), "w") as f:
        f.write(java_template.replace("{package_name}", package_name).replace("{app_url}", app_url))

    # 7.1 AiraFirebaseMessagingService.java
    fcm_service_template = """package {package_name};

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class AiraFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "AiraFCMService";
    public static final String CHANNEL_ID = "aira_properties_alerts";

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        Log.d(TAG, "Refreshed FCM token: " + token);
        getSharedPreferences("aira_fcm_prefs", Context.MODE_PRIVATE).edit().putString("fcm_token", token).apply();
        FCMRegistrationHelper.sendTokenToServer(getApplicationContext(), token, null);
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Log.d(TAG, "FCM Message received from: " + remoteMessage.getFrom());

        String title = "Aira Properties";
        String body = "New property update available";
        String imageUrl = null;
        String clickUrl = "{app_url}";

        // 1. Notification Payload
        if (remoteMessage.getNotification() != null) {
            if (remoteMessage.getNotification().getTitle() != null) {
                title = remoteMessage.getNotification().getTitle();
            }
            if (remoteMessage.getNotification().getBody() != null) {
                body = remoteMessage.getNotification().getBody();
            }
            if (remoteMessage.getNotification().getImageUrl() != null) {
                imageUrl = remoteMessage.getNotification().getImageUrl().toString();
            }
        }

        // 2. Data Payload
        if (remoteMessage.getData().size() > 0) {
            if (remoteMessage.getData().containsKey("title")) {
                title = remoteMessage.getData().get("title");
            }
            if (remoteMessage.getData().containsKey("body")) {
                body = remoteMessage.getData().get("body");
            }
            if (remoteMessage.getData().containsKey("image")) {
                imageUrl = remoteMessage.getData().get("image");
            } else if (remoteMessage.getData().containsKey("imageUrl")) {
                imageUrl = remoteMessage.getData().get("imageUrl");
            }
            if (remoteMessage.getData().containsKey("url")) {
                clickUrl = remoteMessage.getData().get("url");
            } else if (remoteMessage.getData().containsKey("click_action")) {
                clickUrl = remoteMessage.getData().get("click_action");
            }
        }

        showNotification(title, body, imageUrl, clickUrl);
    }

    private void showNotification(String title, String body, String imageUrl, String clickUrl) {
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = notificationManager.getNotificationChannel(CHANNEL_ID);
            if (channel == null) {
                channel = new NotificationChannel(CHANNEL_ID, "Aira Properties Alerts", NotificationManager.IMPORTANCE_HIGH);
                channel.setDescription("Instant property updates, alerts, and offers");
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{0, 250, 250, 250});
                notificationManager.createNotificationChannel(channel);
            }
        }

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("target_url", clickUrl);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pendingIntent = PendingIntent.getActivity(this, (int) System.currentTimeMillis(), intent, flags);

        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .setSound(defaultSoundUri)
                .setVibrate(new long[]{0, 250, 250, 250})
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent);

        if (imageUrl != null && !imageUrl.isEmpty()) {
            Bitmap bitmap = getBitmapFromURL(imageUrl);
            if (bitmap != null) {
                builder.setLargeIcon(bitmap);
                builder.setStyle(new NotificationCompat.BigPictureStyle()
                        .bigPicture(bitmap)
                        .setSummaryText(body));
            } else {
                builder.setStyle(new NotificationCompat.BigTextStyle().bigText(body));
            }
        } else {
            builder.setStyle(new NotificationCompat.BigTextStyle().bigText(body));
        }

        int notificationId = (int) (System.currentTimeMillis() % 100000);
        notificationManager.notify(notificationId, builder.build());
    }

    private Bitmap getBitmapFromURL(String strURL) {
        try {
            URL url = new URL(strURL);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.setConnectTimeout(6000);
            connection.setReadTimeout(6000);
            connection.connect();
            InputStream input = connection.getInputStream();
            return BitmapFactory.decodeStream(input);
        } catch (Exception e) {
            return null;
        }
    }
}
"""
    with open(os.path.join(java_dir, "AiraFirebaseMessagingService.java"), "w") as f:
        f.write(fcm_service_template.replace("{package_name}", package_name).replace("{app_url}", app_url))

    # 7.2 FCMRegistrationHelper.java
    fcm_helper_template = """package {package_name};

import android.content.Context;
import android.util.Log;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class FCMRegistrationHelper {
    private static final String TAG = "AiraFCMHelper";
    private static final String BASE_URL = "https://api.airaproperties.in/api/notifications/register-token";

    public static void sendTokenToServer(Context context, final String token, final String district) {
        sendTokenToServer(context, token, district, null);
    }

    public static void sendTokenToServer(Context context, final String token, final String district, final String userId) {
        if (token == null || token.isEmpty()) return;
        new Thread(new Runnable() {
            @Override
            public void run() {
                int attempts = 0;
                boolean registered = false;
                while (attempts < 3 && !registered) {
                    attempts++;
                    try {
                        StringBuilder urlBuilder = new StringBuilder(BASE_URL);
                        urlBuilder.append("?token=").append(java.net.URLEncoder.encode(token, "UTF-8"));
                        if (district != null && !district.isEmpty()) {
                            urlBuilder.append("&district=").append(java.net.URLEncoder.encode(district, "UTF-8"));
                        }
                        if (userId != null && !userId.isEmpty()) {
                            urlBuilder.append("&userId=").append(java.net.URLEncoder.encode(userId, "UTF-8"));
                        }

                        URL url = new URL(urlBuilder.toString());
                        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                        conn.setRequestMethod("POST");
                        conn.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                        conn.setRequestProperty("Accept", "application/json");
                        conn.setRequestProperty("User-Agent", "AiraAndroidApp/1.2.1");
                        conn.setDoOutput(true);
                        conn.setConnectTimeout(10000);
                        conn.setReadTimeout(10000);

                        JSONObject payload = new JSONObject();
                        payload.put("token", token);
                        if (district != null && !district.isEmpty()) {
                            payload.put("district", district);
                        }
                        if (userId != null && !userId.isEmpty()) {
                            payload.put("userId", userId);
                        }
                        String jsonInputString = payload.toString();

                        try (OutputStream os = conn.getOutputStream()) {
                            byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
                            os.write(input, 0, input.length);
                        }

                        int responseCode = conn.getResponseCode();
                        Log.d(TAG, "Token registration attempt " + attempts + " HTTP " + responseCode);
                        if (responseCode >= 200 && responseCode < 300) {
                            registered = true;
                            Log.d(TAG, "Token registered successfully with backend!");
                            break;
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Token registration error (attempt " + attempts + "): " + e.getMessage());
                    }

                    if (!registered && attempts < 3) {
                        try {
                            Thread.sleep(2000);
                        } catch (InterruptedException ignored) {}
                    }
                }
            }
        }).start();
    }
}
"""
    with open(os.path.join(java_dir, "FCMRegistrationHelper.java"), "w") as f:
        f.write(fcm_helper_template.replace("{package_name}", package_name))

    icon_full_path = os.path.join(os.path.dirname(__file__), icon_src)
    if not os.path.exists(icon_full_path):
        icon_full_path = os.path.join(os.path.dirname(__file__), "..", "images", icon_src)
    if not os.path.exists(icon_full_path):
        icon_full_path = os.path.join(os.path.dirname(__file__), "sparrows.png")

    # 8. Launcher Icons
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }
    img = Image.open(icon_full_path).convert("RGBA")
    for name, size in sizes.items():
        mipmap_path = os.path.join(res_dir, name)
        os.makedirs(mipmap_path, exist_ok=True)
        resized_img = img.resize((size, size), Image.Resampling.LANCZOS)
        resized_img.save(os.path.join(mipmap_path, "ic_launcher.png"))
        resized_img.save(os.path.join(mipmap_path, "ic_launcher_round.png"))
        
    print(f"Project for {app_name} generated successfully.")

def build_project(project_dir, output_apk_name):
    print(f"Building project in {project_dir}...")
    
    # Set JAVA_HOME
    env = os.environ.copy()
    env["JAVA_HOME"] = JAVA_HOME_PATH
    
    # Run Gradle assembleRelease, assembleDebug, and bundleRelease
    try:
        tasks = ["clean", "assembleRelease", "bundleRelease", "--no-daemon"]
        print(f"Executing: gradle {' '.join(tasks)}...")
        res = subprocess.run(
            [GRADLE_PATH] + tasks,
            cwd=project_dir,
            env=env,
            capture_output=True,
            text=True
        )
        if res.returncode != 0:
            print("assembleRelease failed, falling back to assembleDebug...")
            res = subprocess.run(
                [GRADLE_PATH, "assembleDebug", "--no-daemon"],
                cwd=project_dir,
                env=env,
                capture_output=True,
                text=True
            )
            if res.returncode != 0:
                print("Gradle build failed!")
                print(res.stderr)
                print(res.stdout)
                return False
            
        print("Gradle build successful.")
        
        # Locate compiled APK and AAB
        release_apk = os.path.join(project_dir, "app", "build", "outputs", "apk", "release", "app-release.apk")
        debug_apk = os.path.join(project_dir, "app", "build", "outputs", "apk", "debug", "app-debug.apk")
        src_apk = release_apk if os.path.exists(release_apk) else debug_apk
        src_aab = os.path.join(project_dir, "app", "build", "outputs", "bundle", "release", "app-release.aab")

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Extra alias names for full backward compatibility
        extra_names = []
        is_user_app = "user" in project_dir or "airaproperties" in output_apk_name
        if is_user_app:
            extra_names = ["airaproperties.apk", "aira-properties.apk", "sparrows.apk"]
        elif "admin" in project_dir or "admin" in output_apk_name:
            extra_names = ["aira-admin.apk", "airaproperties-admin.apk", "sparrows-admin.apk"]

        all_names = list(set([output_apk_name] + extra_names))
        for name in all_names:
            targets = [
                os.path.join(base_dir, name),
                os.path.join(base_dir, "public", name),
                os.path.join(base_dir, "dist", name),
                os.path.join(base_dir, "server", "src", "uploads", name),
                os.path.join(base_dir, "apk", name),
            ]
            for target in targets:
                os.makedirs(os.path.dirname(target), exist_ok=True)
                safe_copy(src_apk, target)
                print(f"Copied APK to {target}")

        # If AAB is built (Google Play Store Bundle), copy it too!
        if os.path.exists(src_aab):
            aab_names = ["airaproperties-release.aab", "airaproperties.in.aab", "airaproperties.aab"] if is_user_app else ["aira-admin-release.aab"]
            for aab_name in aab_names:
                aab_targets = [
                    os.path.join(base_dir, aab_name),
                    os.path.join(base_dir, "apk", aab_name),
                    os.path.join(base_dir, "public", aab_name),
                    os.path.join(base_dir, "dist", aab_name),
                ]
                for target in aab_targets:
                    os.makedirs(os.path.dirname(target), exist_ok=True)
                    safe_copy(src_aab, target)
                    print(f"Copied Play Store Bundle (AAB) to {target}")

            # Create ZIP bundle with both AAB and APK for direct user download
            if is_user_app:
                zip_path = os.path.join(base_dir, "airaproperties-bundle.zip")
                with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                    zf.write(src_aab, arcname="airaproperties.in.aab")
                    zf.write(src_aab, arcname="airaproperties-release.aab")
                    if os.path.exists(src_apk):
                        zf.write(src_apk, arcname="airaproperties.apk")
                print(f"Created ZIP bundle at {zip_path}")
                for zip_target in [
                    os.path.join(base_dir, "public", "airaproperties-bundle.zip"),
                    os.path.join(base_dir, "dist", "airaproperties-bundle.zip"),
                    os.path.join(base_dir, "public", "airaproperties.zip"),
                    os.path.join(base_dir, "dist", "airaproperties.zip"),
                    os.path.join(base_dir, "public", "airaproperties-in.zip"),
                    os.path.join(base_dir, "dist", "airaproperties-in.zip")
                ]:
                    safe_copy(zip_path, zip_target)
            
        return True
    except Exception as e:
        print(f"Exception during build: {e}")
        return False

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    parent_dir = os.path.dirname(script_dir)

    # Ensure release keystore is ready
    ensure_keystore(KEYSTORE_PATH)

    # Clean old project folders completely to prevent stale domain caching
    for old_folder in ["sparrows_user_proj", "sparrows_admin_proj", "aira_user_proj", "aira_admin_proj"]:
        shutil.rmtree(old_folder, ignore_errors=True)
        shutil.rmtree(os.path.join(parent_dir, old_folder), ignore_errors=True)

    # User App (Aira Properties -> https://airaproperties.in)
    create_android_project(
        project_dir="aira_user_proj",
        app_name="Aira Properties",
        app_url="https://airaproperties.in",
        package_name="airaproperties.in",
        icon_src="app-icon.png"
    )
    
    # Admin App (Aira Admin -> https://airaproperties.in/admin)
    create_android_project(
        project_dir="aira_admin_proj",
        app_name="Aira Admin",
        app_url="https://airaproperties.in/admin",
        package_name="com.airaproperties.admin",
        icon_src="app-icon.png"
    )
    
    # Build User App (creates signed APK + Play Store AAB)
    user_success = build_project("aira_user_proj", "airaproperties.apk")
    
    # Build Admin App (creates signed APK + Play Store AAB)
    admin_success = build_project("aira_admin_proj", "aira-admin.apk")
    
    # Cleanup project folders
    shutil.rmtree("aira_user_proj", ignore_errors=True)
    shutil.rmtree("aira_admin_proj", ignore_errors=True)
    
    if user_success and admin_success:
        print("\n=======================================================")
        print("ALL AIRA PROPERTIES APKS & PLAY STORE AABs COMPILED!")
        print("=======================================================")
    else:
        print("One or more builds failed.")

if __name__ == "__main__":
    main()

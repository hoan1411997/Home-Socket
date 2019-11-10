
#include <ESP8266WiFi.h>
#include <Ticker.h>
#include <Keypad.h>
#include <WebSocketClient.h>
#define PIN_COOL 15
#define PIN_LED LED_BUILTIN
#define PIN_BUTTON 0
#define OFF HIGH
#define ON LOW
#define LED_ON() digitalWrite(PIN_LED, HIGH)
#define LED_OFF() digitalWrite(PIN_LED, LOW)
#define COOL_ON() digitalWrite(PIN_COOL, ON)
#define COOL_OFF() digitalWrite(PIN_COOL, OFF)
Ticker ticker;
int state = 1;
extern String RID;
extern String Rfull;
int TimeState = 0;
bool in_smartconfig = false;
bool longP = true;
const byte ROWS = 4; //four rows
const byte COLS = 3; //three columns
char keys[ROWS][COLS] = {
    {'1', '2', '3'},
    {'4', '5', '6'},
    {'7', '8', '9'},
    {'*', '0', '#'}};
char STR[4] = {'1', '2', '3', '4'};
char str[4] = {' ', ' ', ' ', ' '};
int i, j, count = 0;
byte rowPins[ROWS] = {0, 2, 5, 4};
byte colPins[COLS] = {14, 12, 13};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
//---------------
boolean handshakeFailed = 0;
String data = "";
char path[] = "/";           //identifier of this device
char *host = "192.168.1.10"; //replace this ip address with the ip address of your Node.Js server
const int espport = 8888;
long timeMilisLock = 10000;
WebSocketClient webSocketClient;
unsigned long previousMillis = 0;
unsigned long currentMillis;
unsigned long interval = 300; //interval for sending data to the websocket server in ms
// Use WiFiClient class to create TCP connections
WiFiClient client;
//------------------------
void keyboaralock()
{
    char key = keypad.getKey();

    if (key) // Nhập mật khẩu
    {
        Serial.println(key);
        if (i == 0)
        {
            str[0] = key;
        }
        if (i == 1)
        {
            str[1] = key;
        }
        if (i == 2)
        {
            str[2] = key;
        }
        if (i == 3)
        {
            str[3] = key;
            count = 1;
        }
        i = i + 1;
    }

    if (count == 1)
    {
        if (str[0] == STR[0] && str[1] == STR[1] && str[2] == STR[2] &&
            str[3] == STR[3])
        {
            COOL_ON();
            TimeState = 1;
            i = 0;
            count = 0;
        }
        else
        {
            i = 0;
            count = 0;
        }
    }
    if (key == '*')
    {
        i = 0;
        count = 0;
    }
    if (key == '#')
    {
        i = 0;
        count = 0;
        COOL_OFF();
    }
}
void tick()
{
    //toggle state
    int state = digitalRead(PIN_LED);
    digitalWrite(PIN_LED, !state);
}
void enter_smartconfig()
{
    LED_ON();
    while (WiFi.status() != WL_CONNECTED)
    {

        delay(5000);
        if (WiFi.status() != WL_CONNECTED)
        {

            if (in_smartconfig == false)
            {
                in_smartconfig = true;
                ticker.attach(0.1, tick);
                WiFi.beginSmartConfig();
            }
        }
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println(WiFi.SSID());
    Serial.println(WiFi.localIP());
    Serial.println(WiFi.psk());
    Serial.println(WiFi.BSSIDstr());
    LED_OFF();
}
void exit_smart()
{
    ticker.detach();
    in_smartconfig = false;
}
void setup()
{
    Serial.begin(115200); // Initialize the LED_BUILTIN pin as an output
    delay(10);
    // We start by connecting to a WiFi network
    pinMode(PIN_LED, OUTPUT);
    pinMode(PIN_COOL, OUTPUT);
    COOL_OFF();
    Serial.println();
    Serial.println();
    Serial.print("Watting your mobile app.....");
    enter_smartconfig();

    exit_smart();

    delay(1000);

    wsconnect();
    //  wifi_set_sleep_type(LIGHT_SLEEP_T);
}
void loop()
{
    if (client.connected())
    {
        currentMillis = millis();
        webSocketClient.getData(data);
        if (data.length() > 0)
        {
            Serial.println(data);
            //*************send log data to server in certain interval************************************
            //currentMillis=millis();
            if (abs(currentMillis - previousMillis) >= interval)
            {
                previousMillis = currentMillis;
                //webSocketClient.sendData(data);//send sensor data to websocket server
            }
        }
        else
        {
        }
        delay(5);
    }
    else
    {
        if (WiFi.status() == WL_CONNECTED)
        {
            wsconnect();
        }
        delay(10000);
    }
    keyboaralock();
    if (TimeState > 0)
    {
        delay(timeMilisLock);
        TimeState = 0;
        COOL_OFF();
    }
}
//*********************************************************************************************************************
void wsconnect()
{
    // Connect to the websocket server
    if (client.connect(host, espport))
    {
        Serial.println("Connected");
    }
    else
    {
        Serial.println("Connection failed.");
        delay(1000);

        if (handshakeFailed)
        {
            handshakeFailed = 0;
            ESP.restart();
        }
        handshakeFailed = 1;
    }
    // Handshake with the server
    webSocketClient.path = path;
    webSocketClient.host = host;
    if (webSocketClient.handshake(client))
    {
        Serial.println("Handshake successful");
        String s = "{'mac':'" + WiFi.BSSIDstr() + "','id':'lock01'}";
        webSocketClient.sendData(s);
    }
    else
    {
        Serial.println("Handshake failed.");
        delay(4000);

        if (handshakeFailed)
        {
            handshakeFailed = 0;
            ESP.restart();
        }
        handshakeFailed = 1;
    }
}

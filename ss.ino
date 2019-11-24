#include <ESP8266WiFi.h>
#include <Ticker.h>
#include <Keypad.h>
#include <WebSocketClient.h>
#define PIN_COOL 15
#define PIN_LED LED_BUILTIN
#define PIN_LEDD 3
#define PIN_BUTTON 0
#define OFF HIGH
#define ON LOW
#define COOL_ON() digitalWrite(PIN_COOL, ON)
#define COOL_OFF() digitalWrite(PIN_COOL, OFF)
#define LED_ON() digitalWrite(PIN_LEDD, HIGH)
#define LED_OFF() digitalWrite(PIN_LEDD, LOW)

Ticker ticker;
#include <EEPROM.h>
int state = 1;
bool longP = true;
extern String RID;
extern String Rfull;
long TimeState = 0;
bool in_smartconfig = false;

const byte ROWS = 4; //four rows
const byte COLS = 3; //three columns
char keys[ROWS][COLS] = {
    {'1', '2', '3'},
    {'4', '5', '6'},
    {'7', '8', '9'},
    {'*', '0', '#'}};
int STR[4];
int str[4];
int i, j, count = 0;
byte rowPins[ROWS] = {0, 2, 5, 4};
byte colPins[COLS] = {14, 12, 13};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
//---------------
bool isListeningServer = false;
boolean handshakeFailed = 0;
String data = "";
String dataPrev = "";
char path[] = "/";             //identifier of this device
char *host = "52.221.243.131"; //replace this ip address with the ip address of your Node.Js server
const int espport = 8888;
long timeMilisLock;
WebSocketClient webSocketClient;
unsigned long previousMillis = 0;
unsigned long currentMillis;
unsigned long currentMillisLock;
unsigned long interval = 300; //interval for sending data to the websocket server in ms
// Use WiFiClient class to create TCP connections
int addr_timeMilisLock = 0;
int addr_pass_0 = 1;
int addr_pass_1 = 2;
int addr_pass_2 = 3;
int addr_pass_3 = 4;
///
WiFiClient client;
//------------------------
void erpomValue()
{
    Serial.println("EPROM");
    int value = EEPROM.read(addr_timeMilisLock);
    if (value > 0)
    {
        timeMilisLock = value * 1000;
    }
    else
    {
        timeMilisLock = 5000;
    }
    Serial.println(timeMilisLock);
    value = EEPROM.read(addr_pass_0);
    if (value >= 10)
        value = 0;
    STR[0] = value;
    value = EEPROM.read(addr_pass_1);
    if (value >= 10)
        value = 0;
    STR[1] = value;
    value = EEPROM.read(addr_pass_2);
    if (value >= 10)
        value = 0;
    STR[2] = value;
    value = EEPROM.read(addr_pass_3);
    if (value >= 10)
        value = 0;
    STR[3] = value;
    Serial.println(STR[0]);
    Serial.println(STR[1]);
    Serial.println(STR[2]);
    Serial.println(STR[3]);
    Serial.println("**********");
}
void resetStr()
{
    str[0] = 11;
    str[1] = 11;
    str[2] = 11;
    str[3] = 11;
}
void keyboaralock()
{
    char key = keypad.getKey();
    if (key) // Nhập mật khẩu
    {
        count = 0;
        int value = int(key) - 48;
        Serial.println(value);
        if (i == 0)
        {
            str[0] = value;
        }
        if (i == 1)
        {
            str[1] = value;
        }
        if (i == 2)
        {
            str[2] = value;
        }
        if (i == 3)
        {
            str[3] = value;
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
            webSocketClient.sendData("ON");
            currentMillisLock = millis();
            TimeState = 1;
        }
        Serial.println("NONE");
        Serial.println(str[0]);
        Serial.println(str[1]);
        Serial.println(str[2]);
        Serial.println(str[2]);
        if (str[0] == -13 && str[1] == 0 && str[2] == -13 &&
            str[3] == 0)
        {
            Serial.println("RESET");
            WiFi.disconnect(true);
            longP=true;
        }
        resetStr();
        i = 0;
        count = 0;
    }
    if (key == '*')
    {
        resetStr();
        i = 0;
        count = 0;
    }
    if (key == '#')
    {
        
        COOL_OFF();
        webSocketClient.sendData("OFF");
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
    if (in_smartconfig == false)
    {
        in_smartconfig = true;
        ticker.attach(0.1, tick);
        WiFi.beginSmartConfig();
    }

    Serial.println(WiFi.status());
    Serial.println(WiFi.SSID());
    Serial.println(WiFi.localIP());
    Serial.println(WiFi.psk());
    Serial.println(WiFi.BSSIDstr());
}
void exit_smart()
{
    ticker.detach();
    in_smartconfig = false;
}
void setup()
{
    //WiFi.disconnect(true);
    // WiFi.setAutoConnect(true);
    //WiFi.setAutoReconnect(true);
    // WiFi.reconnect();

    Serial.begin(115200); // Initialize the LED_BUILTIN pin as an output
    delay(10);
    EEPROM.begin(512);
    // We start by connecting to a WiFi network
    pinMode(PIN_LED, OUTPUT);
    pinMode(PIN_LEDD, OUTPUT);
    pinMode(PIN_COOL, OUTPUT);
    COOL_OFF();
    LED_ON();
    Serial.println();
    Serial.println();
    erpomValue();
    Serial.print("Watting your mobile app.....");
    ticker.attach(1, tick);
    delay(6000);
    LED_OFF();
    Serial.println("DONE");
    //  wifi_set_sleep_type(LIGHT_SLEEP_T);
}
void loop()
{

    if (WiFi.status() != WL_CONNECTED && longP)
    {
        LED_ON();
        Serial.println(WiFi.status());
        longP = false;
        enter_smartconfig();
    }

    if (WiFi.status() == WL_CONNECTED && in_smartconfig && WiFi.smartConfigDone())
    {
        exit_smart();
        LED_OFF();
        Serial.println("Connected, Exit smartconfig");
    }
    if (WiFi.status() == WL_CONNECTED && !isListeningServer)
    {
        Serial.println("Enter Setup Ws:");
        wsconnect();
        isListeningServer = true;
    }
    if (client.connected())
    {
        currentMillis = millis();
        webSocketClient.getData(data);
        if (data.length() > 0)
        {

            if (!data.equals(dataPrev))
            {

                dataPrev = data;
                 if (data.equals("alive-n"))
                {
                    
                }else if (data.equals("alive"))
                {
                   
                    webSocketClient.sendData("alive-s");
                }
                else if (data.equals("1111"))
                {
                  if(TimeState==1){
                     TimeState = 0;
                        COOL_OFF();
                        webSocketClient.sendData("OFF");
                  }else{
                    currentMillisLock = millis();
                    TimeState = 1;
                    webSocketClient.sendData("ON");
                    COOL_ON();}
                }
                else
                {
                    Serial.println(data);
                    if (data.equals("0000"))
                    {
                        TimeState = 0;
                        COOL_OFF();
                        webSocketClient.sendData("OFF");
                    }
                    else
                    {
                        long temp = data.toInt();
                        if (temp > 1000)
                        {
                            timeMilisLock = data.toInt();
                            int value = timeMilisLock / 1000;
                            EEPROM.write(addr_timeMilisLock, value);
                            Serial.println(value);
                            delay(15);
                            EEPROM.commit();
                        }
                        if (temp < 100)
                        {
                            if (temp / 10 == 1)
                            {
                                STR[0] = temp % 10;
                                EEPROM.write(addr_pass_0, STR[0]);
                                delay(15);
                                Serial.println("0:");
                                Serial.println(STR[0]);
                                EEPROM.commit();
                            }
                            if (temp / 10 == 2)
                            {
                                STR[1] = temp % 10;
                                EEPROM.write(addr_pass_1, STR[1]);
                                delay(15);
                                Serial.println("1:");
                                Serial.println(STR[1]);
                                EEPROM.commit();
                            }
                            if (temp / 10 == 3)
                            {
                                STR[2] = temp % 10;
                                EEPROM.write(addr_pass_2, STR[2]);
                                delay(15);
                                Serial.println("2:");
                                Serial.println(STR[2]);
                                EEPROM.commit();
                            }
                            if (temp / 10 == 4)
                            {
                                STR[3] = temp % 10;
                                EEPROM.write(addr_pass_3, STR[3]);
                                delay(15);
                                Serial.println("3:");
                                Serial.println(STR[3]);
                                EEPROM.commit();
                            }
                        }
                    }
                }
            }
            //*************send log data to server in certain interval************************************
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
    }
    keyboaralock();
    if (TimeState > 0)
    {
        currentMillis = millis();
        if ((currentMillis - currentMillisLock) > timeMilisLock)
        {
            COOL_OFF();
            webSocketClient.sendData("OFF");
            TimeState = 0;
        }
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
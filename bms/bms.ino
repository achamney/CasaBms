#include <Wire.h>

int A0PIN = A0;  
int A1PIN = A1;
int A2PIN = A2;  
int A3PIN = A3;  
int A6PIN = A6;  
int A7PIN = A7; 
int ledPin = 13;      // select the pin for the LED
int requestNum = 0;
float volts[6];

void setup() {
  Wire.begin(8); // Initiate the Wire library
  Wire.onRequest(requestEvent); // register event
  // declare the ledPin as an OUTPUT:
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  // read the value from the sensor:
  volts[0] = analogRead(A0PIN) * 5.0 / 1024 * 1 - 0.17;
  volts[1] = analogRead(A1PIN) * 5.0 / 1024 * 2 - 0.30;
  volts[2] = analogRead(A2PIN) * 5.0 / 1024 * 3 - 0.40;
  volts[3] = analogRead(A3PIN) * 5.0 / 1024 * 4 - 0.76;
  volts[4] = analogRead(A6PIN) * 5.0 / 1024 * 5 - 1.44;
  volts[5] = analogRead(A7PIN) * 5.0 / 1024 * 6 - 1.1;
  // turn the ledPin on
  for(int i=0;i<6;i++) {
    Serial.println(volts[i]);
  }
  Serial.println();
  delay(5000);
}

void requestEvent()
{
  byte sendByte;
  if (requestNum == 0) {
    sendByte = int(volts[0] * 255 / 5);
  } else {
    sendByte = int((volts[requestNum] - volts[requestNum - 1]) * 255 / 5);
  }
  Serial.print("SENDING DATA: ");
  Serial.print(requestNum);
  Serial.print(" ");
  Serial.print(sendByte);
  Serial.println("");
  requestNum ++;
  if (requestNum >= 6) {
    requestNum = 0;
  }
  Wire.write(sendByte);
}

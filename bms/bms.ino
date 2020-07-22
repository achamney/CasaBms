#include <Wire.h>

int A0PIN = A0;  
int A1PIN = A1;
int A2PIN = A2;  
int A3PIN = A3;  
int A6PIN = A6;  
int A7PIN = A7; 
int ledPin = 13;      // select the pin for the LED
int requestNum = 0;
float volts[7];

void setup() {
  Wire.begin(8); // Initiate the Wire library
  Wire.onRequest(requestEvent); // register event
  // declare the ledPin as an OUTPUT:
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  // read the value from the sensor:
  volts[0] = analogRead(A0PIN) * 5.0 / 1024 * 1 - 0.07;
  volts[1] = analogRead(A1PIN) * 5.0 / 1024 * 2 - 0.07;
  volts[2] = analogRead(A2PIN) * 5.0 / 1024 * 3 - 0.07;
  volts[3] = analogRead(A3PIN) * 5.0 / 1024 * 4 - 0.23;
  volts[4] = analogRead(A6PIN) * 5.0 / 1024 * 5 - 0.90;
  float pin7v = analogRead(A7PIN) * 5.0 / 1024;
  volts[5] = pin7v * 6 - 0.6;
  volts[6] = pin7v * 7 - 0.6;
  // turn the ledPin on
  for(int i=0;i<7;i++) {
    Serial.println(volts[i]);
  }
  Serial.println();
  delay(5000);
}

void requestEvent()
{
  byte sendByte;
  float divideFactor = 1.5;
  if (requestNum % 2 == 0) {
    sendByte = requestNum/2;
  } 
  else {
    int voltIndex = (requestNum - 1)/2;
    if (voltIndex == 0) {
      sendByte = int((volts[0]-3) * 255 / divideFactor);
    } else {
      sendByte = int((volts[voltIndex] - volts[voltIndex - 1] - 3) * 255 / divideFactor);
    }
  }
  Serial.print("SENDING DATA: ");
  Serial.print(requestNum);
  Serial.print(" ");
  Serial.print(sendByte);
  Serial.println("");
  requestNum ++;
  if (requestNum >= 14) {
    requestNum = 0;
  }
  Wire.write(sendByte);
}

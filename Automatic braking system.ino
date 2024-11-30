#define TRIG_PIN 12
#define ECHO_PIN 13
#define BUZZER_PIN 4

// Motor pins
#define IN1 14
#define IN2 27
#define IN3 26
#define IN4 25

// Distance thresholds (in cm)
#define STOP_DISTANCE 20
#define REVERSE_DISTANCE 10

void setup() {
  // Initialize serial monitor
  Serial.begin(115200);
  
  // Pin modes
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  // Ensure motors are stopped initially
  stopMotors();
}

void loop() {
  float distance = measureDistance();
  Serial.println(distance);

  if (distance > STOP_DISTANCE) {
    // No obstacle: Move forward
    moveForward();
    digitalWrite(BUZZER_PIN, LOW);
  } else if (distance <= STOP_DISTANCE && distance > REVERSE_DISTANCE) {
    // Obstacle detected: Stop and sound buzzer
    stopMotors();
    digitalWrite(BUZZER_PIN, HIGH);
  } else if (distance <= REVERSE_DISTANCE) {
    // Obstacle very close: Move backward and sound buzzer
    moveBackward();
    digitalWrite(BUZZER_PIN, HIGH);
  }

  delay(100); // Delay to stabilize readings
}

// Measure distance using ultrasonic sensor
float measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  return (duration * 0.034) / 2; // Convert to cm
}

// Motor control functions
void moveForward() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void moveBackward() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}

void stopMotors() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
}

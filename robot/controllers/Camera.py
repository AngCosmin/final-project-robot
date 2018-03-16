from imutils.video import VideoStream
import imutils
import cv2
import sys

class Camera:
    def __init__(self, colorLower, colorUpper, width=400, usePiCamera=True):
        self.colorLower = colorLower
        self.colorUpper = colorUpper
        self.width = width
        self.camera = VideoStream(usePiCamera=usePiCamera)
        self.camera.start()

    def compute(self):
        x = sys.maxint
        y = sys.maxint

        frame = self.camera.read()

        # Resize frame
        frame = imutils.resize(frame, width=self.width)

        # Apply median filter
        frame = cv2.medianBlur(frame, 3)

        # Convert image to HSV
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # Get pieces within the color range
        mask = cv2.inRange(hsv, self.colorLower, self.colorUpper)

        # Apply gaussian blur
        # mask = cv2.GaussianBlur(mask, (5,5),0)

        # Erodate to eliminate noise
        mask = cv2.erode(mask, None, iterations=2)

        # Dilatate
        mask = cv2.dilate(mask, None, iterations=2)

        # Find contour
        contour = cv2.findContours(mask.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[-2]
        
        # If contour was found
        if len(contour) > 0:
            # Find the largest contour in the mask
            circle = max(contour, key=cv2.contourArea)

            #  Use contour to compute the minimum enclosing circle
            ((x, y), radius) = cv2.minEnclosingCircle(circle)

            M = cv2.moments(circle)
            center = (int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"]))

            if radius > 10:
                # draw the circle and centroid on the frame,
                cv2.circle(frame, (int(x), int(y)), int(radius), (0, 255, 255), 2)
                cv2.circle(frame, center, 5, (0, 0, 255), -1)

        return frame, mask, x, y

    def clean(self):
        self.camera.stop() 
        cv2.destroyAllWindows()
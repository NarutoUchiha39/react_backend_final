import threading
from threading import Timer
import numpy as np
import cv2
import math
import requests

cnt_up = 0
cnt_down = 0
count_up = 0
count_down = 0
p_cnt_up = 0
p_cnt_down = 0
p_count_up = 0
p_count_down = 0
finished = False


def post():
    global finished

    def send():
        thread = Timer(2.0, send)
        thread.start()
        if (cnt_up != p_cnt_up or cnt_down != p_cnt_down or count_up != p_count_up or count_up != p_count_up):
            print("post")
            requests.post(
                "http://localhost:3000/log/flow", json={
                    "in": int(cnt_up+count_up),
                    "out": int(cnt_down+count_down)
                }, headers={
                    "Content-Type": "application/json"
                }
            )
        else:
            print("not post")

        if (finished):
            thread.cancel()

    send()


def realtime():

    global finished
    global cnt_down
    global cnt_up
    global count_down
    global count_up

    class MyPerson:

        tracks = []

        def __init__(self, xi, yi):
            self.x = xi
            self.y = yi
            self.tracks = []
            self.done = False
            self.state = '0'
            self.age = 0
            self.dir = None

        def getState(self):
            return self.state

        def getDir(self):
            return self.dir

        def getX(self):
            return self.x

        def getY(self):
            return self.y

        def updateCoords(self, xn, yn):
            self.age = 0
            self.tracks.append([self.x, self.y])
            self.x = xn
            self.y = yn

        def setDone(self):
            self.done = True

        def timedOut(self):
            return self.done

        def going_UP(self, mid_start, mid_end):
            if len(self.tracks) >= 2 and self.state == '0' and self.tracks[-1][1] < mid_end and self.tracks[-2][1] >= mid_end:
                state = '1'
                self.dir = 'up'
                return True
            else:
                return False

        def going_DOWN(self, mid_start, mid_end):
            if len(self.tracks) >= 2 and self.state == '0' and self.tracks[-1][1] > mid_start and self.tracks[-2][1] <= mid_start:
                state = '1'
                self.dir = 'down'
                return True
            else:
                return False

    cap = cv2.VideoCapture(0)
    #cap = cv2.VideoCapture("/Users/tp/Desktop/GitHub/React_Backend/Backend/Python/PeopleCounter/TestVideo.avi")

    w = cap.get(3)
    h = cap.get(4)
    frameArea = h*w
    areaTH = frameArea/300

    line_up = int(1*(h/5))
    line_down = int(4*(h/5))

    up_limit = int(.5*(h/5))
    down_limit = int(4.5*(h/5))

    pt1 = [0, line_down]
    pt2 = [w, line_down]
    pts_L1 = np.array([pt1, pt2], np.int32)
    pts_L1 = pts_L1.reshape((-1, 1, 2))
    pt3 = [0, line_up]
    pt4 = [w, line_up]
    pts_L2 = np.array([pt3, pt4], np.int32)
    pts_L2 = pts_L2.reshape((-1, 1, 2))
    pt5 = [0, up_limit]
    pt6 = [w, up_limit]
    pts_L3 = np.array([pt5, pt6], np.int32)
    pts_L3 = pts_L3.reshape((-1, 1, 2))
    pt7 = [0, down_limit]
    pt8 = [w, down_limit]
    pts_L4 = np.array([pt7, pt8], np.int32)
    pts_L4 = pts_L4.reshape((-1, 1, 2))
    backgroundSubtractor = cv2.createBackgroundSubtractorMOG2(
        detectShadows=True)
    kernelOp = np.ones((3, 3), np.uint8)
    kernelCl = np.ones((11, 11), np.uint8)
    font = cv2.FONT_HERSHEY_SIMPLEX
    persons = []

    while (cap.isOpened()):
        ret, frame = cap.read()
        fgmask = backgroundSubtractor.apply(frame)
        fgmask2 = backgroundSubtractor.apply(frame)
        try:
            ret, imBin = cv2.threshold(fgmask, 200, 255, cv2.THRESH_BINARY)
            ret, imBin2 = cv2.threshold(fgmask2, 200, 255, cv2.THRESH_BINARY)
            mask = cv2.morphologyEx(imBin, cv2.MORPH_OPEN, kernelOp)
            mask2 = cv2.morphologyEx(imBin2, cv2.MORPH_OPEN, kernelOp)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernelCl)
            mask2 = cv2.morphologyEx(mask2, cv2.MORPH_CLOSE, kernelCl)
        except:
            break
        contours0, hierarchy = cv2.findContours(
            mask2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours0:
            rect = cv2.boundingRect(cnt)
            area = cv2.contourArea(cnt)
            if area > areaTH:
                M = cv2.moments(cnt)
                cx = int(M['m10']/M['m00'])
                cy = int(M['m01']/M['m00'])
                x, y, w, h = cv2.boundingRect(cnt)
                new = True
                if cy in range(up_limit, down_limit):
                    for i in persons:
                        if abs(cx-i.getX()) <= w and abs(cy-i.getY()) <= h:
                            new = False
                            i.updateCoords(cx, cy)
                            if i.going_UP(line_down, line_up) == True:
                                if w > 100:
                                    count_up = w/60
                                else:
                                    cnt_up += 1
                            elif i.going_DOWN(line_down, line_up) == True:
                                if w > 100:
                                    count_down = w/60
                                else:
                                    cnt_down += 1
                            break
                        if i.getState() == '1':
                            if i.getDir() == 'down' and i.getY() > down_limit:
                                i.setDone()
                            elif i.getDir() == 'up' and i.getY() < up_limit:
                                i.setDone()
                        if i.timedOut():
                            index = persons.index(i)
                            persons.pop(index)
                            del i
                    if new == True:
                        p = MyPerson(cx, cy)
                        persons.append(p)
                cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
                img = cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        for i in persons:
            cv2.putText(frame, str(), (i.getX(), i.getY()),
                        font, 0.3, 1, cv2.LINE_AA)
        str_up = 'Entry: ' + str(cnt_up+count_up)
        str_down = 'Exit: ' + str(math.floor(cnt_down+count_down))
        frame = cv2.polylines(frame, [pts_L1], False, (255, 0, 0), thickness=2)
        frame = cv2.polylines(frame, [pts_L2], False, (0, 0, 255), thickness=2)
        frame = cv2.polylines(
            frame, [pts_L3], True, (255, 255, 255), thickness=1)
        frame = cv2.polylines(
            frame, [pts_L4], False, (255, 255, 255), thickness=1)
        cv2.putText(frame, str_up, (10, 40), font, 0.5,
                    (255, 255, 255), 2, cv2.LINE_AA)
        cv2.putText(frame, str_up, (10, 40), font,
                    0.5, (0, 0, 255), 1, cv2.LINE_AA)
        cv2.putText(frame, str_down, (10, 90), font,
                    0.5, (255, 255, 255), 2, cv2.LINE_AA)
        cv2.putText(frame, str_down, (10, 90), font,
                    0.5, (255, 0, 0), 1, cv2.LINE_AA)
        print(str(cnt_up+count_up))
        print(str(math.floor(cnt_down+count_down)))
        k = cv2.waitKey(30) & 0xff
        if k == 27:
            break
    cap.release()
    cv2.destroyAllWindows()
    finished = True


t1 = threading.Thread(target=realtime)
t2 = threading.Thread(target=post)
t1.start()
t2.start()
t1.join()
t2.join()

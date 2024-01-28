import cv2
from ultralytics import YOLO
import math
import threading
import requests
import os
from datetime import date
COLOR = {0:(255,0,0),24:(0,255,0),25:(0,0,255),26:(255,255,0),28:(0,255,255)}
time_rn:str = str(date.today())
from uuid import uuid1
#def post():
k = os.path.dirname(os.path.dirname(os.path.dirname(os.getcwd())))
path = os.path.join(k,"Daashboard_2.0","Dashboard","src","assets","Images_Record") 
PATH_UMBRELLA = os.path.join(path,time_rn,"umbrella")
PATH_PERSON = os.path.join(path,time_rn,"person")
PATH_BAGPACK = os.path.join(path,time_rn,"bagpack") 
    
def check_folder():
    
    if( time_rn not in os.listdir(path)):
        os.mkdir(os.path.join(path,time_rn))
        os.mkdir(os.path.join(path,time_rn,"bagpacks"))
        os.mkdir(os.path.join(path,time_rn,"person"))
        os.mkdir(os.path.join(path,time_rn,"umbrella"))






def ObjectDetection(frame):

        objectDetector = YOLO('yolov8m.pt')
        res = objectDetector(frame,save=True)
        p=False
        for i in res:
            boxes = i.boxes
            for box in boxes:
                x1,y1,x2,y2 = box.xyxy[0]
                x1,y1,x2,y2 = int(x1),int(y1),int(x2),int(y2)
                w,h = x2-x1,y2-y1

                
                if(int(box.cls[0]) == 24 or int(box.cls[0]) == 25 or int(box.cls[0]) == 43 or int(box.cls[0]) == 0 or int(box.cls[0]) == 26 or int(box.cls[0]) == 28):
                    #cv2.putText(frame,conf,(x1,y1-10),cv2.FONT_HERSHEY_COMPLEX,0.7,(0,0,255),1,cv2.LINE_AA)
                    conf = str(math.floor(box.conf.item()*100))

                    if(int(box.cls[0]) == 0):
                        cv2.rectangle(frame,(x1,y1),(x2,y2),COLOR[int(box.cls[0])],3)

                        cv2.putText(frame,i.names[int(box.cls[0])],(x1,y1-10),cv2.FONT_HERSHEY_COMPLEX,0.7,COLOR[int(box.cls[0])],1,cv2.LINE_AA)
                        cv2.imwrite(os.path.join(PATH_PERSON,f"person_{uuid1()}.jpg"),frame[y1:y2,x1:x2])
                        p=True



                    if(int(box.cls[0]) == 24 or int(box.cls[0]) == 26 or int(box.cls[0]) == 28):
                        cv2.rectangle(frame,(x1,y1),(x2,y2),COLOR[int(box.cls[0])],3)
                        cv2.putText(frame,i.names[int(box.cls[0])],(x1,y1-10),cv2.FONT_HERSHEY_COMPLEX,0.7,COLOR[int(box.cls[0])],1,cv2.LINE_AA)
                        cv2.imwrite(os.path.join(PATH_BAGPACK,f"bagpack_{uuid1()}.jpg"),frame[y1:y2,x1:x2])


                    if(int(box.cls[0]) == 25):
                        cv2.rectangle(frame,(x1,y1),(x2,y2),COLOR[int(box.cls[0])],3)
                        cv2.putText(frame,i.names[int(box.cls[0])],(x1,y1-10),cv2.FONT_HERSHEY_COMPLEX,0.7,COLOR[int(box.cls[0])],1,cv2.LINE_AA)
                        cv2.imwrite(os.path.join(PATH_UMBRELLA,f"umbrella_{uuid1()}.jpg"),frame[y1:y2,x1:x2])

            
        return frame,p

       
        
            



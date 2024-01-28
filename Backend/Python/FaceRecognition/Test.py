from datetime import datetime
import math
import cv2
import os
import face_recognition
import pickle
from uuid import uuid1

import time
from collections import defaultdict
import requests
import polars as pl
import requests
import threading
from collections import defaultdict
# from ObjectDetection.ObjectDetection import check_folder,ObjectDetection
global quit1 
quit1 = False

global temp 
temp = defaultdict(int)

temp["Student"] = 0
temp["Teacher"] = 0
temp["Unknown"] = 0

global prev 
prev = defaultdict(int)

prev["Student"] = 0
prev["Teacher"] = 0
prev["Unknown"] = 0

def make_post_request():
    
    def post():
        global prev
        global temp
        global quit1
        
        obj = threading.Timer(5.0, function=post)
        obj.start()
        
        print(temp)
        if(temp != prev):
            
            student = temp["Student"]
            teacher = temp["Teacher"] 
            unknown = temp["Unknown"]
            print({"Student":student,"Teacher":teacher,"Unknown":unknown})
            requests.post("http://localhost:3000/log/FaceDetection",
                         json = {"Student":student,"Teacher":teacher,"Unknown":unknown},
                         headers={"Content-Type":"application/json"})
            prev["Student"] = temp["Student"]
            prev["Teacher"] = temp["Teacher"]
            prev["Unknown"] = temp["Unknown"]
            
        if(quit1):
            obj.cancel()
                
    post()


def check_file():
    
    
    file = open("Record.csv","a+")
    file.seek(0)
    print(file.readline())
    if(file.readline()==""):
        file.write("Email,Category,timestamp\n")

    return file
    

def check_exist(name,timestamp):
    try:
        df = pl.read_csv("Record.csv")
        res = df.filter(pl.col("Email")  == name)
        struct_time1 = time.strptime(timestamp, "%a %b %d %H:%M:%S %Y")
        struct_time2 = time.strptime(res[-1]["timestamp"][0], "%a %b %d %H:%M:%S %Y")
        
        datetime_obj1 = datetime.fromtimestamp(time.mktime(struct_time1))
        datetime_obj2 = datetime.fromtimestamp(time.mktime(struct_time2))

        time_difference = datetime_obj1 - datetime_obj2

        print("Time difference:", time_difference)
        time_difference = time_difference.total_seconds()
        if(math.floor(time_difference)>=30):
            return True

        else:
            return False
    except Exception as e:
        return True
        print(e)


def Initigrate_Camera():
    global quit1
    data = pickle.loads(open("embed.pickle", "rb").read())
    df = check_file()
    # check_folder()
    
    cap = cv2.VideoCapture(0)
   
    
    while(cap.isOpened):
        success,frame = cap.read()
        p = True
        #(frame,p) = ObjectDetection(frame)
        if p:
            boxes = face_recognition.face_locations(frame,model="hog")
            embeddings = face_recognition.face_encodings(frame,boxes)
            names = []
            
            for embedding in embeddings:
                name = "unknown" 
                res = face_recognition.compare_faces(data["embeddings"],embedding,tolerance=0.4)
                faces = defaultdict(int)
                if(True in res):
                    matched = [i for i,b in enumerate(res) if b]
                    for j in matched:
                        faces[data["names"][j]] += 1
                
                    name = max(faces,key=faces.get)
                names.append(name)
            
            
            
            for ((top,right,bottom,left),name) in zip(boxes,names):
                
                

                if(name == "unknown"):
                    temp["Unknown"]+=1
                    if(check_exist(name,str(time.asctime()))):
                        df.write(f"unknown,unknown,{time.asctime()}\n")
                elif(name[-2:]=="_S"):
                    temp["Student"]+=1
                    check_exist(name,str(time.asctime()))
                    
                    if(check_exist(name,str(time.asctime()))):

                        df.write(f"{name},Student,{time.asctime()}\n")

                else:
                    temp["Teacher"]+=1
                    if(check_exist(name,str(time.asctime()))):
                        df.write(f"{name},Teacher,{time.asctime()}\n")

                df.flush()
                y = top - 15 if top - 15 > 15 else top + 15
                cv2.rectangle(frame,(left,top),(right,bottom),(255,0,0),2)
                cv2.putText(frame, name, (left, y), cv2.FONT_HERSHEY_SIMPLEX,.8, (0, 255, 255), 2)
            
        cv2.imshow("Face recognition",frame)
        if(cv2.waitKey(1) & 0XFF == ord('q')):
            break
        
    cap.release()
    cv2.destroyAllWindows()
    quit1 = True




t2 = threading.Thread(target=Initigrate_Camera)
#t1 = threading.Thread(target=make_post_request)

t2.start()
#t1.start()

#t1.join()
t2.join()
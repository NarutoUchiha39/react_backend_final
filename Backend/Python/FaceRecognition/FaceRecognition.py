#%%
import cv2
import os
import face_recognition
import pickle
from uuid import uuid1
import time
from collections import defaultdict
import requests
import pandas as pd
#%%



def Test():

    data = pickle.loads(open("embed.pickle", "rb").read())
    
    
    
    TEST_PATH = "Test"
    for i in os.listdir(TEST_PATH):
      if i == "Test_Results" or i == ".ipynb_checkpoints" or i=="Test_Results_1":
        continue
      names = []
      Image = cv2.imread(os.path.join(TEST_PATH,i),cv2.IMREAD_COLOR)
      Image = cv2.cvtColor(Image,cv2.COLOR_BGR2RGB)
      
      first = time.time()
      
      location = face_recognition.face_locations(Image,model='hog')
      embeddings = face_recognition.face_encodings(Image,location)
      for embedding in embeddings:
        
        res = face_recognition.compare_faces(data["embeddings"],embedding,tolerance=0.4)
        faces = defaultdict(int)
        if(True in res):
         matched = [i for i,b in enumerate(res) if b]
         for j in matched:
          faces[data["names"][j]] += 1
    
         name = max(faces,key=faces.get)
         print(name)
         
         names.append(name)
         
      second = time.time()
      print()
      print("Prediction time ================> ",(second-first),' seconds')
      print()
      if(not names):
          names+=["unknown"]*len(location)
    
      for ((top, right, bottom, left), name) in zip(location, names):
        cv2.rectangle(Image, (left, top), (right, bottom),(0, 255, 225), 2)
        y = top - 15 if top - 15 > 15 else top + 15
        cv2.putText(Image, name, (left, y), cv2.FONT_HERSHEY_SIMPLEX,.8, (0, 255, 255), 2)
    
      cv2.imwrite(os.path.join("Test","Test_Results_1",i),Image)
    
def Train(list_names):
    BASE_FOLDER = "Train"
    
    embeddingFinal = []
    names = []
    
    for i in list_names:
      counter = 0
      for j in os.listdir(os.path.join(BASE_FOLDER,i)):
        Image = cv2.imread(os.path.join(BASE_FOLDER,i,j),cv2.IMREAD_COLOR)
        Image = cv2.cvtColor(Image,cv2.COLOR_BGR2RGB)
    
    
        location = face_recognition.face_locations(Image,model='hog')
        embeddings = face_recognition.face_encodings(Image,location)
        counter+=1
        
        print(f"processing image: {i} Completed: {counter}/{len(os.listdir(os.path.join(BASE_FOLDER,i)))}")
        for embedding in embeddings:
          embeddingFinal.append(embedding)
          names.append(i)
    
    try:
            f = open("embed.pickle","rb")
            ob = pickle.load(f)
            embeddings_file = ob["embeddings"]
            names_file = ob["names"]
            embeddings_file+=embeddingFinal
            names_file+=names
            f.close()
            
            f2 = open("embed.pickle","wb")
            f2.write(pickle.dumps({"embeddings":embeddings_file,"names":names_file}))
            f2.close()
            
            
    except FileNotFoundError:
        with open("embed.pickle","wb") as f:
            f.write(pickle.dumps({"embeddings":embeddingFinal,"names":names}))
        

def handle_file():
    is_empty= False
    file = open("Student_List.txt","a+")
    file.seek(0)
    word = file.readline()
    if(len(word) == 0):
        is_empty  = True
        
    return file,is_empty

def click_picture(folder,name=None):
    cap = cv2.VideoCapture(0)
    
    while(cap.isOpened):
        success,frame = cap.read()
        if(cv2.waitKey(1) & 0XFF == ord('q')):
            break
        if(cv2.waitKey(1) & 0XFF == ord('p')):
            if(folder=="Train"):
                name_image = os.path.join(folder,name,f"{name}_{uuid1()}.jpg")
            else:
                name_image = os.path.join(folder,f"{uuid1()}.jpg")
            cv2.imwrite(name_image,frame)
            if(name):
                print("Picture stored at ",name_image)
            else:
                print("Picture stored at ",name_image)
            
        cv2.imshow("Press p to take photo",frame)
    cap.release()
    cv2.destroyAllWindows()
    
    
def add_person():
    
    file,is_empty = handle_file()
    
    while True:
        
        name = input("Enter name or press q to quit: ")
        if(name.lower() == "q"):
            file.close()
            break
        if(not name):
            print("Name cannot be empty !!")
        else:
            try:
                os.makedirs(os.path.join("Train",name))
                if(is_empty):
                    file.write(name)
                else:
                    file.write(f"\n {name}")
                click_picture("Train",name)
                
            except FileExistsError as e:
                print("Name already exists !!")
                

def Call_Train():
    file,is_empty = handle_file()
    if(is_empty):
        print("No new Names to train exiting !!")
        return
    
    list_names = []
    file.seek(0)
    
    list_names = [i.split('\n')[0] for i in file.readlines()]
    print(list_names)
    file.close()
    os.remove("Student_List.txt")
    Train(list_names)
    
def Initigrate_Camera():
    data = pickle.loads(open("embed.pickle", "rb").read())

    
    cap = cv2.VideoCapture(0)
    while(cap.isOpened):
        success,frame = cap.read()
        boxes = face_recognition.face_locations(frame,model="hog")
        embeddings = face_recognition.face_encodings(frame,boxes)
        print(boxes)
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
              y = top - 15 if top - 15 > 15 else top + 15
              cv2.rectangle(frame,(left,top),(right,bottom),(255,0,0),2)
              cv2.putText(frame, name, (left, y), cv2.FONT_HERSHEY_SIMPLEX,.8, (0, 255, 255), 2)
            
        cv2.imshow("Face recognition",frame)
        if(cv2.waitKey(1) & 0XFF == ord('q')):
            break
        
    cap.release()
    cv2.destroyAllWindows()
def Test_Google(Image_Name):
    
    data = pickle.loads(open("embed.pickle", "rb").read())
    TEST_PATH = "Test"
    names = []
    Image = cv2.imread(os.path.join(TEST_PATH,Image_Name),cv2.IMREAD_COLOR)
    Image = cv2.cvtColor(Image,cv2.COLOR_BGR2RGB)
    

    
    location = face_recognition.face_locations(Image,model='hog')
    embeddings = face_recognition.face_encodings(Image,location)
    for embedding in embeddings:
      
      res = face_recognition.compare_faces(data["embeddings"],embedding,tolerance=0.4)
      faces = defaultdict(int)
      if(True in res):
       matched = [i for i,b in enumerate(res) if b]
       for j in matched:
        faces[data["names"][j]] += 1
  
       name = max(faces,key=faces.get)
       print(name)
       
       names.append(name)
       
    
   
    if(not names):
        names+=["unknown"]*len(location)
  
    for ((top, right, bottom, left), name) in zip(location, names):
      cv2.rectangle(Image, (left, top), (right, bottom),(0, 255, 225), 2)
      y = top - 15 if top - 15 > 15 else top + 15
      cv2.putText(Image, name, (left, y), cv2.FONT_HERSHEY_SIMPLEX,.8, (0, 255, 255), 2)
  
    cv2.imwrite(os.path.join("Test","Test_Results_1",Image_Name),Image)
    
    
            
    
if __name__ == "__main__":
    
    print('''             1) Press 1 to take picture to train 
             
             2) Press 2 to train
    
             3) Press 3 to take pictures for test
    
             4) Press 4 to test
    
             5) Press 5 for realtime face detection
    
             6) Press 6 to quit
          
          ''')
    while True :
        choice  = int(input("Enter choice: "))
        if(choice==1):
            add_person()
            
        if(choice == 2):
            Call_Train()
            
        if(choice == 3):
            click_picture("Test")
            
        if(choice == 4):
            Test()
            
        if(choice == 5):
            Initigrate_Camera()
        
        if(choice==6):
            try:
                os.remove("Student_List.txt")
                break
            except Exception:
                break
#%%
import requests
import threading
from collections import defaultdict
from ObjectDetection.ObjectDetection import check_folder,ObjectDetection
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



def Initigrate_Camera():
    global quit1
    data = pickle.loads(open("embed.pickle", "rb").read())
    df = check_file()
    #check_folder()
    
    cap = cv2.VideoCapture(0)
   
    
    while(cap.isOpened):
        success,frame = cap.read()
        p=True
        #frame,p = ObjectDetection(frame)
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
                    df.write(f"unknown,unknown,{time.asctime()}\n")
                    df.flush()
                elif(name[-2:]=="_S"):
                    temp["Student"]+=1
                    df.write(f"{name},Student,{time.asctime()}\n")
                    df.flush()
                else:
                    temp["Teacher"]+=1
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












# %%

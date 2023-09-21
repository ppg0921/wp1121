# Web Programming HW#1


## Install dependencies

和 [課程講義](https://github.com/ntuee-web-programming/112-1-unit1-todo-list/blob/main/README.md#6-mongodb-setup-week-2) 做一樣的事情

```bash
cd backend

yarn

cd frontend

yarn
```
但還會需要：
```bash
cd backend

yarn add nodemon

yarn add mongodb

yarn add mongoose
```

## 改 .env.example
   
1. 把檔名改成.env
2. 把檔案裡的URL改成自己mongodb的URL，跟上課講義的readme方法一樣  
   ( [上課講義](https://github.com/ntuee-web-programming/112-1-unit1-todo-list/blob/main/README.md#6-mongodb-setup-week-2) )
   

##  Run backend

```bash
yarn dev
```

## Features

### 新增日記
> 點擊左上角的 "add diary" 按鈕可以到新增頁面
>
> 日期自動設成當天日期
> 要選擇心情(mood)和標籤(tag)，並輸入內文，之後可按儲存。若要回到首頁可點"back to homepage" 按鈕。

### 編輯日記
> 在首頁中點任意日記可以進入瀏覽畫面(此時為不可修改的狀態)，若要編輯可點擊上方 "edit" 按鈕，此時可改變**日期**、心情、標籤或內文，可按儲存或取消回到瀏覽畫面，若要回到首頁可點"back to homepage" 按鈕。
>
### Fliter 功能
>在首頁上方可看到兩個下拉式選單，可以分別選擇心情和標籤，若要取消Filter則選下拉式選單的第一個選項即可。只有同時符合兩個Filter的日記會出現在首頁。


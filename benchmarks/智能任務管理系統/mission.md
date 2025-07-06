# 首月任務 1：Benchmark 實戰篇

> 請在成功入會後第一個月內完成此任務。

<mark style="background-color:green;">**現在，是時候讓你自由發揮來實戰一份系統了。**</mark>

對一個研究組織而言，最重要的是什麼？是 Benchmark（研究基準）。

為了能夠讓所有成員都能高效率地進行各式各樣的 AI x BDD 研究，最重要的就是要提供「各式各樣不同類型應用程式」的 Feature files（一個應用程式可能會涉及幾十個 feature files 都是很正常的，有幾個功能就至少有幾個 Feature files）。

這樣未來大家在進行 AI x BDD 研究時，就能快速切換使用不同的 Benchmark 來搜集不同類型應用程式其 AI 全自動化軟體開發的能力數據，搜集各種不同類型系統上的表現。

最後，如果你沒有試著自己幹出一個 Benchmark System 的話，又要如何從中感受到 AI x BDD 的落地能力及其研究瓶頸呢？所以來吧！入會之後的第一件事，就是來幹一個 Benchmark System。

### 任務指示

1. 首先，請你先選擇，你想要貢獻哪一個類型的 Benchmark？（前端 Benchmark / 後端 Benchmark）
   1. 目前本組織的研究方向是以「後端」為主，還沒有發展前端的 Benchmark，因此目前推薦選擇後端 Benchmark，這樣才有其他的範例參考。如果你有豐富的想法，想要成為「前端 Benchmark]的開拓者，歡迎你挑戰。
2. 請你試想一個系統主題，作為你想要開發的目標系統，此系統必須符合底下標準，才會被認可為一個合格的貢獻：
   1. 系統至少有 8 道 API Endpoints：
      1. 至少 6 道 API 是「修改系統/資料庫資料庫資料狀態」相關的 API Endpoints
      2. 至少 2 道 API 「查詢資料庫資料」 API Endpoints。
   2. 至少要有一道 API 的功能邏輯符合底下特徵：
      1. 其程式碼的 Cyclomatic Complexity >= 8（[基本解釋](https://chatgpt.com/share/686519ef-ccfc-8007-9958-0d01699d2302)）。
3. 參考[功能概述文件範例](../benchmarks/特務雲端人資系統/requirement.md)，針對你想要開發的目標系統，撰寫一份系統功能中文/英文功能概述文件。
    - [如果你選擇的是前端 Benchmark] 你可以到 [Benchmark 資料夾下](../benchmarks/) 找一個既有的後端 Benchmark，這樣你就不必自己撰寫系統功能概述文件，直接沿用他的即可，還能直接沿用他定義的 API Spec 呢！
4. 接著，參考 [Benchmark 範例資料夾下的所有 Feature files](../benchmarks/特務雲端人資系統/後端/features/)，針對你要實作的目標系統，去撰寫對應的 Feature files。
    - 建議：為每一個功能，或甚至是某個大功能的多個面向，分別都撰寫至一個 Feature file 之中。好比：登入就寫成一個 Feature、註冊也寫成一個 Feature。當然，你可以發展自己的做法。
    - 範例中的 Feature files 寫法僅供參考，裡面目前是以水球老師所鑽研出最可靠的寫法為主，但是你可以試著發展出自己的做法，畢竟規格化 (Formulation) 的部分就是最關鍵的研究部分了。
    - 心靈雞湯：寫 Feature files 很累，沒錯，但記得，如果沒有一個像樣的 Benchmark，後面的研究都沒辦法做了，因此這絕對是先苦後甘，值得投入大把心力去確定你的 Feature, Scenarios 足夠充分。況且，軟體工程師未來大多數時間，應該也都是在寫 Feature files 了，Feature 寫得越完整，在開發階段就能越少人類介入。
5. 請以你所撰寫的 Feature File  作為基礎，試著完整地遵守 BDD 流程實作其對應的系統。無論你是使用 AI 來完成全部的程式，或者是有人力輔助，都可以。實作是為了讓你找出所有可以優化 Feature files 的地方，因此在這個階段請你暫時不需要追求「AI 全自動化」的開發，你只需要先追求「至少把這個系統實作完成」就好。因此，記得在實作的過程中，要持續優化你的 Feature file，這樣才可以確保 Benchmark 確實可以落地到實作上。
    - 如果你選擇的是「後端 Benchmark」，那麼你要實作的是此系統所有後端 API 實現的程式，並且此程式要完整通過此 Feature files。
        - Feature files 測試層級之選擇：每一道 scenario 的測試層級必須是 End to end test (e.g., API Test)，你可以自行添加整合或單元測試混合。
    - 如果你選擇的是「前端 Benchmark」，那麼你要實作的是此系統的前端線框稿畫面以及完全符合前端 Feature files 所規範的使用者操作流程（可以只用 Mock data 就好，不需要真的串接後端）。
        - Feature files 測試層級之選擇：每一道 scenario 的測試層級必須是 End to end test (e.g., Cypress），你可以自行添加整合或單元測試混合。


### Benchmark 資料夾架構規範
> 請參考 [Benchmark 系統範例](../benchmarks/特務雲端人資系統/)。

1. 你的 Benchmark 系統要放在 [Benchmark 資料夾](../benchmarks)中，並且資料夾命名必須為你的系統名稱，好比：特務雲端人資系統。
2. 系統資料夾下的結構如下：
    - `api/` - 放著你所有規格化定義的 API 文件。
    - `後端/features` - 如果你是後端 Benchmark，則將你的後端 Feature files 放置於此資料夾中。
    - `後端/app` - 如果你是後端 Benchmark，則將你的後端系統程式碼實作放置於此資料夾中。
    - `前端/wireframes` - 如果你是前端 Benchmark，則將你的前端線框稿規格相關文件或配置檔案放在此資料夾中，並至少提供一個教學文件說明該如何使用此線框規格文件。
    - `前端/features` - 如果你是前端 Benchmark，則將你的前端 User flow 放置於此資料夾中。
    - `前端/app` - 如果你是前端 Benchmark，則將你的前端網頁程式碼實作放置於此資料夾中。
    - `AUTHOR` - 證明你具備此 Benchmark 著作權的署名。
    - `README.md` - 介紹此 Benchmark 的設計及相關想法。
    - `requirement.md` - 用自然語言（中文/英文）撰寫此 Benchmark 系統的需求規格，概述一下功能即可，當然如果你要寫得完整一點也行，但切記需求規格需與其他規格文件 （如：前後端 Feature file） 一致。

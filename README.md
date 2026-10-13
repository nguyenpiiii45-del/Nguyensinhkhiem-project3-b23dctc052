# Web3 DAO Application

Ứng dụng Web3 DAO DApp kết nối Smart Contract trên Ethereum/EVM.

## Tính năng chính
- Kết nối ví Web3 (MetaMask)
- Tạo và quản lý đề xuất (Proposals)
- Bỏ phiếu (Voting) cho các đề xuất DAO
- Xem danh sách cử tri (Voters) và trạng thái đề xuất
- Tương tác trực tiếp với Smart Contract `DominionDAO`

## Cài đặt & Khởi chạy

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc:
```env
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
```

### 3. Chạy ứng dụng ở môi trường phát triển
```bash
npm start
```
Ứng dụng sẽ chạy tại `http://localhost:3000`.

### 4. Build ứng dụng
```bash
npm run build
```

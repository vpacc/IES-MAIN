import { clerkClient } from "@clerk/express"

// Middleware ( Protect Educator Routes )
export const protectEducator = async (req, res, next) => {
    try {
        // Kiểm tra xem req.auth tồn tại không
        if (!req.auth) {
            console.error("req.auth không tồn tại");
            return res.status(401).json({success: false, message: 'Không tìm thấy thông tin xác thực'});
        }

        const userId = req.auth.userId;
        
        // Kiểm tra userId có tồn tại và hợp lệ không
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            console.error("User ID không hợp lệ:", userId);
            return res.status(401).json({success: false, message: 'User ID không hợp lệ'});
        }
        
        console.log("Đang xác thực user ID:", userId);
        
        try {
            const response = await clerkClient.users.getUser(userId);
            
            // Kiểm tra response có hợp lệ không
            if (!response) {
                console.error("Không nhận được phản hồi từ Clerk API");
                return res.status(401).json({success: false, message: 'Không thể xác thực người dùng'});
            }
            
            // Kiểm tra vai trò của người dùng
            if (!response.publicMetadata || response.publicMetadata.role !== 'educator') {
                console.log("Người dùng không có vai trò educator:", response.publicMetadata);
                return res.status(403).json({success: false, message: 'Bạn không có quyền educator'});
            }
            
            next();
            
        } catch (clerkError) {
            console.error("Lỗi khi gọi Clerk API:", clerkError);
            return res.status(401).json({success: false, message: 'Không thể xác thực với Clerk: ' + clerkError.message});
        }
    } catch (error) {
        console.error("Lỗi xác thực:", error);
        return res.status(500).json({success: false, message: 'Lỗi server khi xác thực người dùng'});
    }
}
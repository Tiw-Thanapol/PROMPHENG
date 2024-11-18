const prisma = require("../config/prisma")

exports.listUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                enabled: true,
                address: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        })
        res.send(users)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!" })
    }
}
exports.changeStatus = async (req, res) => {
    try {
        const { id, enabled } = req.body
        console.log(id, enabled)
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { enabled: enabled }
        })
        res.send('changeStatus', id, enabled)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!" })
    }
}
exports.changeRole = async (req, res) => {
    try {
        const { id, role } = req.body
        console.log(id, role)
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { role: role }
        })

        res.send('changeRole')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!" })
    }
}
exports.userCart = async (req, res) => {
    try {
        const { cart } = req.body;
        console.log(cart);
        console.log(req.user.id);

        const user = await prisma.user.findFirst({
            where: { id: Number(req.user.id) },
        });
        //console.log(user)

        //Check quantity
        for (const item of cart) {
            //console.log(item)
            const product = await prisma.product.findUnique({
                where: {id: item.id},
                select:{ quantity:true,title:true}
            })
            //console.log(item)
            //console.log(product)
            if(!product || item.count > product.quantity) {
                return res.status(400).json({
                    ok: false,
                    message: `Sorry Product ${product?.title || "product"} Out of stock`
                })
            }
        }

        // Delete old Cartเพื่อที่จะเพิ่มสินค้าใหม่
        await prisma.productOnCart.deleteMany({
            where: { cart: { orderedById: user.id } }
        })
        console.log(user)
        // Delete old Cart
        await prisma.cart.deleteMany({
            where: { orderedById: user.id }
        })
        // เตรียมสินค้า
        let products = cart.map((item) => ({
            productId: item.id,
            count: item.count,
            price: item.price
        }))

        //หาผลรวม
        let cartTotal = products.reduce((sum, item) =>
            sum + item.price * item.count, 0)

        //New Cart
        const { newCart } = await prisma.cart.create({
            data: {
                products: { create: products },
                cartTotal: cartTotal,
                orderedById: user.id
            }
        })
        console.log(cartTotal)
        res.send('userCart')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!" })
    }
}
exports.getUserCart = async (req, res) => {
    try {
        //req.user.id ตัวนี้วิ่งไปทุกหน้า
        const cart = await prisma.cart.findFirst({
            where: { orderedById: Number(req.user.id) },
            include: { products: { include: { product: true } } }
        })
        //console.log(cart)
        res.json({ products: cart.products, cartTotal: cart.cartTotal })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!" })
    }
}

// exports.getUserCart = async (req, res) => {
//     try {
//         // ตรวจสอบว่ามี req.user หรือไม่
//         if (!req.user || !req.user.id) {
//             return res.status(401).json({ message: "Unauthorized" });
//         }

//         const cart = await prisma.cart.findFirst({
//             where: { 
//                 orderedById: Number(req.user.id),
//                 status: 'PENDING' // ถ้ามี status field
//             },
//             include: { 
//                 products: {
//                     include: {
//                         product: true
//                     }
//                 }
//             }
//         });

//         // ถ้าไม่มีตะกร้า ให้ส่งค่าเริ่มต้น
//         if (!cart) {
//             return res.json({
//                 products: [],
//                 cartTotal: 0
//             });
//         }

//         // คำนวณ cartTotal จากสินค้าในตะกร้า
//         const cartTotal = cart.products.reduce((total, item) => {
//             return total + (item.product.price * item.quantity);
//         }, 0);

//         res.json({
//             products: cart.products || [],
//             cartTotal: cartTotal
//         });

//     } catch (err) {
//         console.error('Error in getUserCart:', err);
//         res.status(500).json({ 
//             message: "Failed to fetch cart",
//             error: process.env.NODE_ENV === 'development' ? err.message : undefined
//         });
//     }
// }
// exports.getUserCart = async (req, res) => {
//     try {
//         const cart = await prisma.cart.findFirst({
//             where: { orderedById: Number(req.user.id) },
//             include: { products: { include: { product: true } } }
//         });

//         // ถ้าไม่พบตะกร้าสินค้า ส่งค่าเริ่มต้นกลับไป
//         if (!cart) {
//             return res.json({
//                 products: [],
//                 cartTotal: 0
//             });
//         }

//         // ถ้าพบตะกร้าสินค้า ส่งข้อมูลกลับไป
//         res.json({
//             products: cart.products || [],
//             cartTotal: cart.cartTotal || 0
//         });

//     } catch (err) {
//         console.error('Error in getUserCart:', err);
//         res.status(500).json({ 
//             message: "Server Error!",
//             error: process.env.NODE_ENV === 'development' ? err.message : undefined
//         });
//     }
// }
exports.emptyCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: { orderedById: Number(req.user.id) }
        })
        if (!cart) {
            return res.status(400).json({ message: "No cart" })
        }
        await prisma.productOnCart.deleteMany({
            where: { cartId: cart.id }
        })
        const result = await prisma.cart.deleteMany({
            where: { orderedById: Number(req.user.id) }
        })
        console.log(result)
        res.json({
            message: "cart empty seuccess",
            delete: result.count
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!" })
    }
}
exports.saveAddress = async (req, res) => {
    try {
        const { address } = req.body
        console.log(address)
        const addressUser = await prisma.user.update({
            where: { id: Number(req.user.id) }, data: { address: address }
        })
        res.json({ ok: true, message: "Address update success!" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!" })
    }
}
exports.userProfile = async (req, res) => {
    try {
      // ตรวจสอบว่า token มีอยู่หรือไม่
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required!' });
      }
  
      // ตรวจสอบ token และดึงข้อมูลผู้ใช้
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // ใช้ JWT_SECRET ที่ตั้งใน .env
      const userId = decoded.id;
  
      // ดึงข้อมูลผู้ใช้จาก Prisma
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }
  
      res.json(user); // ส่งข้อมูลโปรไฟล์กลับไปยัง Frontend
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error!' });
    }
  };
  
  // ฟังก์ชันเพื่ออัพเดตข้อมูลโปรไฟล์
  exports.updateProfile = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required!' });
      }
  
      // ตรวจสอบ token และดึงข้อมูลผู้ใช้
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
  
      // ข้อมูลที่ได้รับจาก Frontend
      const { name, email, phone, address } = req.body;
  
      // อัพเดตข้อมูลในฐานข้อมูล
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          phone,
          address,
        },
      });
  
      res.json(updatedUser); // ส่งข้อมูลที่อัพเดตกลับไป
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  };
exports.saveOrder = async (req, res) => {
    try {
      //code
      // Step 0 Check Stripe
      // console.log(req.body)
      // return res.send('hello Save Order!!!')
      // stripePaymentId String
      // amount          Int
      // status          String
      // currency       String
      const { id, amount, status, currency } = req.body.paymentIntent;
  
      // Step 1 Get User Cart
      const userCart = await prisma.cart.findFirst({
        where: {
          orderedById: Number(req.user.id),
        },
        include: { products: true },
      });
  
      // Check Cart empty
      if (!userCart || userCart.products.length === 0) {
        return res.status(400).json({ ok: false, message: "Cart is Empty" });
      }
  
      const amountTHB = Number(amount) / 100;
      // Create a new Order
      const order = await prisma.order.create({
        data: {
          products: {
            create: userCart.products.map((item) => ({
              productId: item.productId,
              count: item.count,
              price: item.price,
            })),
          },
          orderedBy: {
            connect: { id: req.user.id },
          },
          cartTotal: userCart.cartTotal,
          stripePaymentId: id,
          amount: amountTHB,
          status: status,
          currency: currency,
        },
      });
      // stripePaymentId String
      // amount          Int
      // status          String
      // currency       String
  
      // Update Product
      const update = userCart.products.map((item) => ({
        where: { id: item.productId },
        data: {
          quantity: { decrement: item.count },
          sold: { increment: item.count },
        },
      }));
      console.log(update);
  
      await Promise.all(update.map((updated) => prisma.product.update(updated)));
  
      await prisma.cart.deleteMany({
        where: { orderedById: Number(req.user.id) },
      });
      res.json({ ok: true, order });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server Error" });
    }
  };
exports.getOrder = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { orderedById: Number(req.user.id) },
            include: {
                products: {
                    include: { product: true }
                }
            }
        })
        if (orders.length === 0) {
            return res.status(400).json({ ok: true, message: "No Orders" })
        }

        res.json({ ok: true, orders })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error!" })
    }
}
import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { listCategory } from "../api/Category";
import { listProduct, searchFilters } from "../api/product";
import _ from "lodash";

// ======================================================
// API
// ======================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";


// ======================================================
// AXIOS
// ======================================================

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});


// ======================================================
// STORE
// ======================================================

const ecomStore = (set, get) => ({

  // ====================================================
  // AUTH STATE
  // ====================================================

  user: null,

  isAuthenticated: false,

  authLoading: true,


  // ====================================================
  // ECOMMERCE STATE
  // ====================================================

  categories: [],

  products: [],

  carts: [],


  // ====================================================
  // AUTH ACTIONS
  // ====================================================

  /**
   * Login
   *
   * Backend:
   * POST /api/login
   *
   * Server จะสร้าง Database Session
   * และส่ง Session Cookie แบบ HttpOnly
   *
   * ไม่เก็บ token ใน localStorage
   */

  actionLogin: async (form) => {

    try {

      const res = await api.post(
        "/login",
        form
      );


      const user =
        res.data?.payload ||
        res.data?.user;


      if (!user) {

        throw new Error(
          "Login response ไม่พบข้อมูลผู้ใช้"
        );

      }


      set({

        user,

        isAuthenticated: true,

        authLoading: false,

      });


      return res;


    } catch (err) {

      set({

        user: null,

        isAuthenticated: false,

        authLoading: false,

      });


      throw err;

    }

  },


  // ====================================================
  // CHECK CURRENT USER
  // ====================================================

  /**
   * ตรวจสอบ Session จาก Cookie
   *
   * POST /api/current-user
   *
   * Browser จะส่ง HttpOnly Cookie
   * อัตโนมัติผ่าน withCredentials
   */

  actionCurrentUser: async () => {

    try {

      set({
        authLoading: true,
      });


      const res = await api.post(
        "/current-user"
      );


      const user =
        res.data?.payload ||
        res.data?.user;


      if (!user) {

        throw new Error(
          "Current user response ไม่พบข้อมูลผู้ใช้"
        );

      }


      set({

        user,

        isAuthenticated: true,

        authLoading: false,

      });


      return user;


    } catch (err) {

      set({

        user: null,

        isAuthenticated: false,

        authLoading: false,

      });


      return null;

    }

  },


  // ====================================================
  // LOGOUT
  // ====================================================

  /**
   * Logout
   *
   * หมายเหตุ:
   *
   * ตอนนี้ Backend ต้องมี
   *
   * POST /api/logout
   *
   * เพื่อ revoke Database Session
   *
   */

  actionLogout: async () => {

    try {

      await api.post(
        "/logout"
      );

    } catch (err) {

      console.error(
        "Logout error:",
        err
      );

    } finally {

      set({

        user: null,

        isAuthenticated: false,

        authLoading: false,

        categories: [],

        products: [],

        carts: [],

      });

    }

  },


  // ====================================================
  // CLEAR AUTH
  // ====================================================

  /**
   * ใช้กรณี Session หมดอายุ
   * หรือ Backend ตอบ 401
   */

  clearAuth: () => {

    set({

      user: null,

      isAuthenticated: false,

      authLoading: false,

    });

  },


  // ====================================================
  // CART
  // ====================================================

  actionAddtoCart: (product) => {

    const carts =
      get().carts;


    const updateCart = [

      ...carts,

      {
        ...product,
        count: 1,
      },

    ];


    const unique =
      _.unionWith(
        updateCart,
        _.isEqual
      );


    set({
      carts: unique,
    });

  },


  // ====================================================
  // UPDATE CART QUANTITY
  // ====================================================

  actionUpdateQuantity: (
    productId,
    newQuantity
  ) => {

    set((state) => ({

      carts:

        state.carts.map(
          (item) =>

            item.id === productId

              ? {
                  ...item,
                  count:
                    Math.max(
                      1,
                      newQuantity
                    ),
                }

              : item
        ),

    }));

  },


  // ====================================================
  // REMOVE CART ITEM
  // ====================================================

  actionRemoveProduct: (
    productId
  ) => {

    set((state) => ({

      carts:

        state.carts.filter(
          (item) =>
            item.id !== productId
        ),

    }));

  },


  // ====================================================
  // TOTAL PRICE
  // ====================================================

  getTotalPrice: () => {

    return get().carts.reduce(

      (total, item) => {

        return (
          total +
          Number(item.price || 0) *
          Number(item.count || 0)
        );

      },

      0

    );

  },


  // ====================================================
  // CATEGORY
  // ====================================================

  getCategory: async () => {

    try {

      const res =
        await listCategory();


      set({

        categories:
          res.data,

      });

    } catch (err) {

      console.error(
        "Get category error:",
        err
      );

    }

  },


  // ====================================================
  // PRODUCT
  // ====================================================

  getProduct: async (count) => {

    try {

      const res =
        await listProduct(count);


      set({

        products:
          res.data,

      });

    } catch (err) {

      console.error(
        "Get product error:",
        err
      );

    }

  },


  // ====================================================
  // SEARCH PRODUCT
  // ====================================================

  actionSearchFilters: async (arg) => {

    try {

      const res =
        await searchFilters(arg);


      set({

        products:
          res.data,

      });

    } catch (err) {

      console.error(
        "Search product error:",
        err
      );

    }

  },


  // ====================================================
  // CLEAR CART
  // ====================================================

  clearCart: () => {

    set({
      carts: [],
    });

  },


});


// ======================================================
// PERSIST
// ======================================================
//
// สำคัญ:
//
// ไม่ persist user
// ไม่ persist authentication
// ไม่ persist session token
//
// เพราะ Authentication ใช้ HttpOnly Cookie
//
// Persist เฉพาะข้อมูลที่เหมาะกับ Client เช่น cart
// ======================================================

const usePersist = {

  name: "ecom-store",

  storage:
    createJSONStorage(
      () => localStorage
    ),

  partialize: (state) => ({

    carts:
      state.carts,

  }),

};


// ======================================================
// CREATE STORE
// ======================================================

const useEcomStore =
  create(
    persist(
      ecomStore,
      usePersist
    )
  );


// ======================================================
// EXPORT
// ======================================================

export default useEcomStore;
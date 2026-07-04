import React from "react";
import { motion } from "framer-motion";
import {
  Utensils,
  CheckCircle2,
  ChefHat,
  Sparkles,
  BadgeCheck,
  PackageCheck,
  PartyPopper,
  ShoppingBag,
  Clock
} from "lucide-react";

const spring = {
  type: "spring",
  stiffness: 260,
  damping: 24
};

export default function LiveTracker({ activeOrder }) {

  if (!activeOrder) return null;

  const status = activeOrder.status?.toUpperCase();

  const currentStep =
    status === "PENDING"
      ? 0
      : status === "PREPARING"
      ? 1
      : status === "READY"
      ? 2
      : 3;

  const progressWidth = [
  "0%",
  "33%",
  "66%",
  "calc(100% - 70px)"
][currentStep];

  const queue =
    activeOrder.queuePosition ??
    activeOrder.queue ??
    activeOrder.token_number ??
    "-";

  const eta =
    activeOrder.estimatedTime ??
    Math.max(queue * 4, 2);

  const steps = [
    {
      title: "Received",
      icon: CheckCircle2
    },
    {
      title: "Preparing",
      icon: ChefHat
    },
    {
      title: "Ready to Pick",
      icon: PackageCheck
    },
    {
      title: "Delivered",
      icon: ShoppingBag
    }
  ];

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 20
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      transition={spring}

      style={{

        background: "rgba(255,255,255,0.82)",

        border: "1px solid rgba(15,76,129,.08)",

        backdropFilter: "blur(18px)",

        borderRadius: 24,

        padding: 30,

        boxShadow:
          "0 10px 45px rgba(15,76,129,.08)",

        overflow: "hidden",

        position: "relative"

      }}

    >

      <div

        style={{

          position: "absolute",

          left: 0,

          right: 0,

          top: 0,

          height: 4,

          background:
            "linear-gradient(90deg,#2563eb,#14b8a6,#d4af37)"

        }}

      />

      {/* HEADER */}

      <div

        style={{

          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",

          marginBottom: 28

        }}

      >

        <div>

          <p

            style={{

              margin: 0,

              fontSize: 12,

              fontWeight: 700,

              color: "#94a3b8",

              letterSpacing: 1.5,

              textTransform: "uppercase"

            }}

          >

            Order Token

          </p>

          <h1

            style={{

              margin: "6px 0",

              fontSize: 34,

              fontWeight: 900,

              color: "#0f172a"

            }}

          >

            #{activeOrder.token_number || activeOrder.id}

          </h1>

        </div>

        <div style={{ textAlign: "right" }}>

          <p

            style={{

              margin: 0,

              fontSize: 12,

              fontWeight: 700,

              color: "#94a3b8",

              textTransform: "uppercase"

            }}

          >

            Queue Position

          </p>

          <h1

            style={{

              margin: "6px 0",

              color: "#2563eb",

              fontWeight: 900,

              fontSize: 32

            }}

          >

            #{queue}

          </h1>

          <p

            style={{

              margin: 0,

              color: "#64748b",

              fontWeight: 600,

              fontSize: 13

            }}

          >

            <Clock
              size={14}
              style={{
                display: "inline",
                marginRight: 5
              }}
            />

            Approx. {eta} mins

          </p>

        </div>

      </div>

      {/* STATUS BADGE */}

      <div

        style={{

          display: "inline-flex",

          alignItems: "center",

          gap: 8,

          background: "#eff6ff",

          color: "#1d4ed8",

          padding: "8px 18px",

          borderRadius: 999,

          fontWeight: 800,

          marginBottom: 28

        }}

      >

        {status === "READY"
          ?<BadgeCheck size={20} />
          : <ChefHat size={18}/>}

        {status === "PENDING"
          ? "RECEIVED"
          : status === "READY"
          ? "READY TO PICK UP"
          : status}

      </div>

      {/* PROGRESS */}

      <div

        style={{

          position: "relative",

          marginBottom: 45,

          paddingTop: 6

        }}

      >

        {/* Background Line */}

        <div

          style={{

            position: "absolute",

            left: 35,

            right: 35,

            top: 27,

            height: 5,

            borderRadius: 999,

            background: "#e2e8f0"

          }}

        />

        {/* Animated Line */}

        <motion.div

          animate={{
            width: progressWidth
          }}

          transition={{
            duration: .8
          }}

          style={{

            position: "absolute",

            left: 35,

            top: 27,

            height: 5,

            borderRadius: 999,

            background:
              "linear-gradient(90deg,#2563eb,#14b8a6)",

            width: progressWidth

          }}

        />

        <div

          style={{

            display: "flex",

            justifyContent: "space-between",

            position: "relative"

          }}

        >
                  {steps.map((step, index) => {

            const Icon = step.icon;

            const active = currentStep >= index;

            const current = currentStep === index;

            return (

              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 90,
                  zIndex: 2
                }}
              >

                <motion.div

                  animate={
                    current
                      ? {
                          scale: [1, 1.12, 1]
                        }
                      : {}
                  }

                  transition={{
                    repeat: Infinity,
                    duration: 2
                  }}

                  style={{

                    width: 48,

                    height: 48,

                    borderRadius: "50%",

                    display: "flex",

                    justifyContent: "center",

                    alignItems: "center",

                    background: active
                      ? "linear-gradient(135deg,#2563eb,#14b8a6)"
                      : "#fff",

                    border: active
                      ? "none"
                      : "2px solid #cbd5e1",

                    color: active
                      ? "#fff"
                      : "#94a3b8",

                    boxShadow: active
                      ? "0 8px 24px rgba(37,99,235,.25)"
                      : "none"

                  }}

                >

                  <Icon size={20}/>

                </motion.div>

                <span

                  style={{

                    marginTop: 10,

                    fontWeight: 700,

                    fontSize: 13,

                    color: active
                      ? "#0f172a"
                      : "#94a3b8",

                    textAlign: "center"

                  }}

                >

                  {step.title}

                </span>

              </div>

            );

          })}

        </div>

      </div>

      {/* READY CARD */}

      {

        status === "READY" && (

          <motion.div

            initial={{
              opacity: 0,
              scale: .9
            }}

            animate={{
              opacity: 1,
              scale: 1
            }}

            style={{

              background:
                "linear-gradient(135deg,#10b981,#059669)",

              color: "#fff",

              padding: 26,

              borderRadius: 20,

              textAlign: "center",

              marginBottom: 28,

              boxShadow:
                "0 15px 40px rgba(16,185,129,.30)"

            }}

          >

            <PartyPopper
              size={42}
              style={{
                marginBottom: 12
              }}
            />

            <h2

              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 900
              }}

            >

              Your Order is Ready!

            </h2>

            <p

              style={{
                marginTop: 10,
                opacity: .95,
                fontSize: 16
              }}

            >

              Please collect your order from the pickup counter.

            </p>

            <div

              style={{

                marginTop: 18,

                display: "inline-block",

                padding: "10px 22px",

                borderRadius: 999,

                background: "rgba(255,255,255,.2)",

                fontWeight: 900,

                fontSize: 18

              }}

            >

              Token #{activeOrder.id}

            </div>

          </motion.div>

        )

      }

      {/* DELIVERED CARD */}

      {

        status === "DELIVERED" && (

          <motion.div

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            style={{
  background: "linear-gradient(135deg,#2563eb 0%, #1d4ed8 30%, #14b8a6 100%)",
  color: "#fff",
  borderRadius: 24,
  padding: "32px",
  textAlign: "center",
  marginBottom: 30,
  boxShadow: "0 15px 40px rgba(29,78,216,.22)"
}}

          >

            <ShoppingBag
              size={42}
              style={{
                marginBottom: 12
              }}
            />

            <h2
              style={{
                margin: 0,
                fontWeight: 900
              }}
            >

              Order Delivered

            </h2>

            <p
              style={{
                marginTop: 10
              }}
            >


              Enjoy your meal!
<br/>

              Thank you for using UniHub.

              
              
            </p>

          </motion.div>

        )

      }

      {/* ORDER SUMMARY */}

      <div

        style={{

          background: "#f8fafc",

          borderRadius: 18,

          padding: 22,

          border: "1px solid #e2e8f0"

        }}

      >

        <h3

          style={{

            marginTop: 0,

            display: "flex",

            alignItems: "center",

            gap: 8,

            color: "#475569"

          }}

        >

          <Utensils size={18}/>

          Order Summary

        </h3>

        <div

          style={{

            display: "flex",

            flexDirection: "column",

            gap: 12

          }}

        >
                 {activeOrder.items.map((item, index) => (

            <motion.div

              key={index}

              initial={{ opacity: 0, x: -10 }}

              animate={{ opacity: 1, x: 0 }}

              transition={{ delay: index * 0.08 }}

              style={{

                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                padding: "12px 0",

                borderBottom:
                  index !== activeOrder.items.length - 1
                    ? "1px solid #e2e8f0"
                    : "none"

              }}

            >

              <div>

                <div

                  style={{

                    fontWeight: 800,

                    color: "#0f172a",

                    fontSize: 15

                  }}

                >

                  🍽 {item.name}

                </div>

                <div

                  style={{

                    color: "#64748b",

                    marginTop: 4,

                    fontSize: 13

                  }}

                >

                  Quantity : {item.quantity}

                </div>

              </div>

              <div

                style={{

                  fontWeight: 900,

                  color: "#1d4ed8",

                  fontSize: 16

                }}

              >

                ₹{item.price * item.quantity}

              </div>

            </motion.div>

          ))}

        </div>

        {/* TOTAL */}

        <div

          style={{

            marginTop: 24,

            paddingTop: 18,

            borderTop: "2px dashed #cbd5e1",

            display: "flex",

            justifyContent: "space-between",

            alignItems: "center"

          }}

        >

          <div>

            <div

              style={{

                color: "#64748b",

                fontWeight: 700,

                fontSize: 14

              }}

            >

              Total Amount

            </div>

            <div

              style={{

                fontSize: 30,

                fontWeight: 900,

                background:
                  "linear-gradient(90deg,#2563eb,#14b8a6)",

                WebkitBackgroundClip: "text",

                WebkitTextFillColor: "transparent"

              }}

            >

              ₹{activeOrder.total}

            </div>

          </div>

          <div

            style={{

              background:
                "linear-gradient(135deg,#2563eb,#14b8a6)",

              color: "#fff",

              padding: "12px 18px",

              borderRadius: 14,

              fontWeight: 800

            }}

          >

            {status === "PENDING"
              ? "Received"

              : status === "PREPARING"
              ? "Preparing"

              : status === "READY"
              ? "Ready to Pick Up"

              : "Delivered"}

          </div>

        </div>

      </div>

    </motion.div>

  );

} 
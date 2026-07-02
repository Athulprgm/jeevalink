import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore.js";
import { useAppStore } from "../store/appStore.js";
import { ArrowLeft, ArrowRight, UserPlus, Droplets } from "lucide-react";
import confetti from "canvas-confetti";
import api from "../store/api.js";
import CameraCapture from "../components/CameraCapture.jsx";

const step1DonorSchema = z.object({
  fullName: z.string().min(2, "Minimum 2 characters"),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Valid 10-digit Indian mobile required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Minimum 6 characters"),
  confirmPassword: z.string().min(6, "Minimum 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const step1HospitalSchema = z.object({
  fullName: z.string().min(2, "Minimum 2 characters"),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Valid 10-digit Indian mobile required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Minimum 6 characters"),
  confirmPassword: z.string().min(6, "Minimum 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const step2DonorSchema = z.object({
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  dateOfBirth: z.string().min(1, "Date of birth required"),
  sex: z.enum(["male", "female", "transgender"], { message: "Sex is required" }),
  pincode: z.string().length(6, "Must be 6 digits"),
  fullAddress: z.string().min(5, "Minimum 5 characters for full address"),
  district: z.string().min(2, "Minimum 2 characters"),
  city: z.string().min(2, "Minimum 2 characters"),
  idProofFront: z
    .any()
    .refine((files) => files?.length === 1, "ID Front image is required"),
  idProofBack: z
    .any()
    .refine((files) => files?.length === 1, "ID Back image is required"),
  profilePicture: z
    .any()
    .refine((file) => !!file, "Profile selfie is required"),
});

const step2HospitalSchema = z.object({
  pincode: z.string().length(6, "Must be 6 digits"),
  fullAddress: z.string().min(5, "Minimum 5 characters for full address"),
  district: z.string().min(2, "Minimum 2 characters"),
  city: z.string().min(2, "Minimum 2 characters"),
  idProofFront: z
    .any()
    .refine((files) => files?.length === 1, "ID Front image is required"),
  idProofBack: z
    .any()
    .refine((files) => files?.length === 1, "ID Back image is required"),
});

export default function Register() {
  const [role, setRole] = useState("donor"); // 'donor' or 'hospital'
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const { register: registerUser, loading } = useAuthStore();
  const { triggerToast } = useAppStore();
  const navigate = useNavigate();

  const {
    register: reg1,
    handleSubmit: handleS1,
    formState: { errors: e1 },
  } = useForm({
    resolver: zodResolver(
      role === "donor" ? step1DonorSchema : step1HospitalSchema,
    ),
    defaultValues: step1Data || {
      fullName: "",
      mobileNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const {
    register: reg2,
    handleSubmit: handleS2,
    formState: { errors: e2 },
    setValue: setV2,
    watch: watch2,
  } = useForm({
    resolver: zodResolver(
      role === "donor" ? step2DonorSchema : step2HospitalSchema,
    ),
  });

  const onStep1 = (data) => {
    setStep1Data(data);
    setStep(2);
  };

  const onPincodeBlur = async (e) => {
    const pin = e.target.value;
    if (pin.length === 6) {
      try {
        const res = await api.get(`/location/pincode/${pin}`);
        if (res.data.success) {
          setV2("district", res.data.district, { shouldValidate: true });
          setV2("city", res.data.district, { shouldValidate: true });
        }
      } catch (err) {
        console.warn('Failed to fetch pincode details:', err);
      }
    }
  };

  const onStep2 = async (data) => {
    const finalData = {
      ...step1Data,
      ...data,
      role,
      idProofFront: data.idProofFront?.[0],
      idProofBack: data.idProofBack?.[0],
    };
    const res = await registerUser(finalData);
    if (res.success) {
      if (role === "hospital") {
        triggerToast(
          "Registration submitted! Awaiting administrator approval.",
          "success",
        );
        navigate("/hospital/dashboard");
      } else {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#DC2626", "#B91C1C", "#ffffff"],
        });
        triggerToast("Welcome to JeevaLink! 🎉", "success");
        navigate("/donor/dashboard");
      }
    } else {
      triggerToast("Registration failed. Try again.", "error");
    }
  };

  const inputCls =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400";
  const errCls = "text-[10px] text-red-500 font-bold mt-1 pl-1 block";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <Droplets className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              JeevaLink
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-5">
            Join 12,000+
            <br />
            Lifesavers 🩸
          </h1>
          <p className="text-red-200 text-lg leading-relaxed mb-8">
            Register as a blood donor or hospital and become part of India's
            largest life-saving network. Free, fast, and forever.
          </p>
          {[
            "Free to register — no hidden fees",
            "Smart donor-patient matching",
            "Emergency SOS alerts near you",
            "Earn JeevaPoints for every donation",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-red-100 text-sm font-semibold">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Tab Selector for Donor vs Hospital */}
          {step === 1 && (
            <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-6 shadow-sm border border-slate-200/50">
              <button
                type="button"
                onClick={() => {
                  setRole("donor");
                  setStep1Data(null);
                }}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${role === "donor" ? "bg-white text-slate-900 shadow-sm border border-slate-200/10" : "text-gray-500 hover:text-gray-700"}`}
              >
                Become a Donor
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("hospital");
                  setStep1Data(null);
                }}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${role === "hospital" ? "bg-white text-slate-900 shadow-sm border border-slate-200/10" : "text-gray-500 hover:text-gray-700"}`}
              >
                Register Hospital
              </button>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="flex justify-center gap-2 mb-4">
              <div
                className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-slate-200"}`}
              />
              <div
                className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-slate-200"}`}
              />
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              {role === "donor"
                ? step === 1
                  ? "Create Account"
                  : "Donor Details"
                : step === 1
                  ? "Hospital Account"
                  : "Hospital Details"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Step {step} of 2 —{" "}
              {step === 1
                ? "Basic credentials"
                : role === "donor"
                  ? "Blood group & location"
                  : "Hospital address & district"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key={`s1-${role}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleS1(onStep1)}
                className="space-y-4 card p-6"
              >
                {[
                  {
                    field: "fullName",
                    label: role === "donor" ? "Full Name" : "Hospital Name",
                    type: "text",
                    placeholder:
                      role === "donor" ? "Athul Reji" : "Apollo Hospital",
                    err: e1.fullName,
                  },
                  {
                    field: "mobileNumber",
                    label: "Mobile Number",
                    type: "tel",
                    placeholder: "9876543210",
                    err: e1.mobileNumber,
                  },
                  {
                    field: "email",
                    label: "Email Address ",
                    type: "email",
                    placeholder:
                      role === "donor"
                        ? "donor@jeevalink.org"
                        : "hospital@jeevalink.org",
                    err: e1.email,
                  },
                  {
                    field: "password",
                    label: "Password",
                    type: "password",
                    placeholder: "••••••••",
                    err: e1.password,
                  },
                  {
                    field: "confirmPassword",
                    label: "Confirm Password",
                    type: "password",
                    placeholder: "••••••••",
                    err: e1.confirmPassword,
                  },
                ].map(({ field, label, type, placeholder, err }) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      {label}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      {...reg1(field)}
                      className={inputCls}
                    />
                    {err && <span className={errCls}>{err.message}</span>}
                  </div>
                ))}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-red-200 mt-2 cursor-pointer"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs text-gray-500 pt-1">
                  Already registered?{" "}
                  <Link
                    to="/login"
                    className="text-primary font-bold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key={`s2-${role}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleS2(onStep2)}
                className="space-y-4 card p-6"
              >
                {role === "donor" ? (
                  <>
                    <div className="mb-4 flex flex-col items-center">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 text-center w-full">
                        Profile Photo (Selfie Capture)
                      </label>
                      <CameraCapture
                        value={watch2("profilePicture")}
                        onCapture={(file) => setV2("profilePicture", file, { shouldValidate: true })}
                      />
                      <input type="hidden" {...reg2("profilePicture")} />
                      {e2.profilePicture && (
                        <span className={`${errCls} text-center`}>{e2.profilePicture.message}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                        Blood Group
                      </label>
                      <select {...reg2("bloodGroup")} className={inputCls}>
                        <option value="">Select</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                          (bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ),
                        )}
                      </select>
                      {e2.bloodGroup && (
                        <span className={errCls}>{e2.bloodGroup.message}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        {...reg2("dateOfBirth")}
                        className={inputCls}
                      />
                      {e2.dateOfBirth && (
                        <span className={errCls}>{e2.dateOfBirth.message}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                        Sex / Gender
                      </label>
                      <select {...reg2("sex")} className={inputCls}>
                        <option value="">Select Sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="transgender">Transgender</option>
                      </select>
                      {e2.sex && (
                        <span className={errCls}>{e2.sex.message}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      Hospital Street Address
                    </label>
                    <input
                      type="text"
                      placeholder="MG Road, Kochi"
                      {...reg2("address")}
                      className={inputCls}
                    />
                    {e2.address && (
                      <span className={errCls}>{e2.address.message}</span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      placeholder="682001"
                      {...reg2("pincode", {
                        onBlur: onPincodeBlur,
                      })}
                      className={inputCls}
                    />
                    {e2.pincode && (
                      <span className={errCls}>{e2.pincode.message}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      Full Address
                    </label>
                    <input
                      type="text"
                      placeholder="House No, Street Name"
                      {...reg2("fullAddress")}
                      className={inputCls}
                    />
                    {e2.fullAddress && (
                      <span className={errCls}>{e2.fullAddress.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      District
                    </label>
                    <input
                      type="text"
                      placeholder="Ernakulam"
                      {...reg2("district")}
                      className={inputCls}
                    />
                    {e2.district && (
                      <span className={errCls}>{e2.district.message}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Kochi"
                      {...reg2("city")}
                      className={inputCls}
                    />
                    {e2.city && (
                      <span className={errCls}>{e2.city.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      ID Proof Front
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      {...reg2("idProofFront")}
                      className={`${inputCls} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 p-2`}
                    />
                    {e2.idProofFront && (
                      <span className={errCls}>{e2.idProofFront.message}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                      ID Proof Back
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      {...reg2("idProofBack")}
                      className={`${inputCls} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 p-2`}
                    />
                    {e2.idProofBack && (
                      <span className={errCls}>{e2.idProofBack.message}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 text-gray-700 font-semibold rounded-2xl text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md text-sm disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? "Registering…" : "Complete Registration"}{" "}
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

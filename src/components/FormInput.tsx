interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  register: any;
  error?: string;
}

export default function FormInput({ label, name, type = "text", placeholder, register, error }: FormInputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`w-full p-4 bg-slate-900/50 border ${
          error ? "border-rose-500" : "border-slate-700"
        } rounded-2xl text-white outline-none focus:border-rose-500 transition-all placeholder:text-slate-600`}
      />
      {error && <p className="text-rose-500 text-xs italic ml-1">{error}</p>}
    </div>
  );
}
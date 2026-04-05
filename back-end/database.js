import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Conectado com sucesso");
  } catch (err) {
    console.error("❌ Erro ao conectar ao MongoDB:", err.message);
    process.exit(1);
  }
};

const TreinoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  contexto: String,
  tempoTotal: Number,
  erros: [
    {
      ouvi: String,
      correcao: String,
      id: Number
    }
  ],
  feedbackGeral: String,
  data: { type: Date, default: Date.now }
});

export const Treino = mongoose.model("Treino", TreinoSchema);
export default connectDB;
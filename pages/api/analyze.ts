import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) return res.status(500).json({ error: 'Erreur de téléchargement' });

    const filePath = Array.isArray(files.file) ? files.file[0].filepath : files.file.filepath;
    const text = fs.readFileSync(filePath, 'utf-8');

    const prompt = `Voici un extrait d'un compte rendu médical :\n\n${text}\n\nExplique ce compte rendu de manière claire et simple, sans jargon médical, comme si tu t'adressais à un patient. Sois fidèle au contenu.`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Tu es un médecin pédagogue qui vulgarise les comptes rendus pour les patients." },
        { role: "user", content: prompt },
      ],
    });

    fs.unlinkSync(filePath); // suppression du fichier après traitement

    res.status(200).json({ result: completion.data.choices[0].message?.content });
  });
}

import supabase from "../libs/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

// --- Company Profile ---
export const createCompany = async (req, res) => {
  const {
    id,
    workspace_id,

    // Business info
    business_name,
    industry,
    kra_pin,
    company_email,
    company_phone,
    location,

    // Statutory
    nssf_employer,
    shif_employer,
    housing_levy_employer,
    helb_employer,
    // Bank
    bank_name,
    branch_name,
    account_name,
    account_number,
  } = req.body;

  const logoFile = req.file;

  if (!business_name) {
    return res.status(400).json({ error: "Business name is required." });
  }

  try {
    let logoUrl = "";

    // 1. Upload logo to Supabase Storage if a file is provided
    if (logoFile) {
      const fileExt = logoFile.originalname.split(".").pop();
      const fileName = `${workspace_id}/${uuidv4()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("company-logos")
        .upload(fileName, logoFile.buffer, { contentType: logoFile.mimetype });

      if (uploadError) {
        console.error("Logo upload error:", uploadError);
        throw new Error("Failed to upload logo.");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("company-logos").getPublicUrl(fileName);

      logoUrl = publicUrl;
    }

    const payload = {
      ...(id && { id }),
      workspace_id,
      business_name,
      industry,
      kra_pin,
      company_email,
      company_phone,
      location,
      nssf_employer,
      shif_employer,
      housing_levy_employer,
      helb_employer,
      bank_name,
      branch_name,
      account_name,
      account_number,
      logo_url: logoUrl || req.body.logo_url,
      status: "PENDING",
    };

    // Remove undefined values (VERY IMPORTANT)
    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key],
    );

    const { data, error: insertError } = await supabase
      .from("companies")
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (insertError) {
      console.error("Company insert error:", insertError);
      throw new Error("Failed to save company details.");
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Create company error:", error);
    res.status(500).json({ error: error.message });
  }
};

// --- Departments ---
export const manageDepartments = {
  list: async (req, res) => {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("company_id", req.params.companyId);
    res.json(data || []);
  },
  create: async (req, res) => {
    const { company_id, name } = req.body;

    const { data, error } = await supabase
      .from("departments")
      .insert([{ company_id, name }])
      .select()
      .single();
    if (error) return res.status(400).json(error);
    res.json(data);
  },
  delete: async (req, res) => {
    await supabase.from("departments").delete().eq("id", req.params.id);
    res.status(204).send();
  },
};

// --- Sub-Departments / Projects / Sections ---
export const manageSubDepartments = {
  list: async (req, res) => {
    const { data, error } = await supabase
      .from("sub_departments")
      .select("*, departments(name)")
      .eq("company_id", req.params.companyId);
    res.json(data || []);
  },
  create: async (req, res) => {
    const { data, error } = await supabase
      .from("sub_departments")
      .insert([req.body])
      .select()
      .single();
    if (error) return res.status(400).json(error);
    res.json(data);
  },
};

// --- Job Titles ---
export const manageJobTitles = {
  list: async (req, res) => {
    const { data, error } = await supabase
      .from("job_titles")
      .select("*")
      .eq("company_id", req.params.companyId);
    res.json(data || []);
  },
  create: async (req, res) => {
    const { data, error } = await supabase
      .from("job_titles")
      .insert([req.body])
      .select()
      .single();
    if (error) return res.status(400).json(error);
    res.json(data);
  },
};

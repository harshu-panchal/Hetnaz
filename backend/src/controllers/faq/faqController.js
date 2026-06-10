import Faq from '../../models/Faq.js';

// Get active FAQs for customers
export const getFaqs = async (req, res, next) => {
  try {
    let faqs = await Faq.find({ isActive: true }).sort({ order: 1 });
    if (faqs.length === 0) {
      // Seed default FAQs
      const defaultFaqs = [
        {
          question: "How do I add coins to my wallet?",
          answer: "You can purchase coins by going to the Buy Coins page. Select a plan that suits you and complete the payment using Razorpay.",
          category: "General",
          order: 1,
          isActive: true
        },
        {
          question: "How much do messages cost?",
          answer: "Message costs vary based on your membership tier. Basic tier costs 20 coins per message, while higher tiers offer discounts.",
          category: "General",
          order: 2,
          isActive: true
        },
        {
          question: "How do I withdraw coins?",
          answer: "Coin withdrawal is available for female users only. Male users can use coins to send messages and gifts.",
          category: "General",
          order: 3,
          isActive: true
        },
        {
          question: "What happens if my payment fails?",
          answer: "If your payment fails, no coins will be deducted. You can try the payment again or contact support for assistance.",
          category: "General",
          order: 4,
          isActive: true
        },
        {
          question: "Can I get a refund?",
          answer: "Refunds are handled on a case-by-case basis. Please contact our support team for refund requests.",
          category: "General",
          order: 5,
          isActive: true
        }
      ];
      await Faq.insertMany(defaultFaqs);
      faqs = await Faq.find({ isActive: true }).sort({ order: 1 });
    }

    res.status(200).json({
      status: 'success',
      data: faqs
    });
  } catch (error) {
    next(error);
  }
};

// Admin list all FAQs (active/inactive)
export const listFaqsAdmin = async (req, res, next) => {
  try {
    let faqs = await Faq.find().sort({ order: 1 });
    if (faqs.length === 0) {
      // Seed default FAQs
      const defaultFaqs = [
        {
          question: "How do I add coins to my wallet?",
          answer: "You can purchase coins by going to the Buy Coins page. Select a plan that suits you and complete the payment using Razorpay.",
          category: "General",
          order: 1,
          isActive: true
        },
        {
          question: "How much do messages cost?",
          answer: "Message costs vary based on your membership tier. Basic tier costs 20 coins per message, while higher tiers offer discounts.",
          category: "General",
          order: 2,
          isActive: true
        },
        {
          question: "How do I withdraw coins?",
          answer: "Coin withdrawal is available for female users only. Male users can use coins to send messages and gifts.",
          category: "General",
          order: 3,
          isActive: true
        },
        {
          question: "What happens if my payment fails?",
          answer: "If your payment fails, no coins will be deducted. You can try the payment again or contact support for assistance.",
          category: "General",
          order: 4,
          isActive: true
        },
        {
          question: "Can I get a refund?",
          answer: "Refunds are handled on a case-by-case basis. Please contact our support team for refund requests.",
          category: "General",
          order: 5,
          isActive: true
        }
      ];
      await Faq.insertMany(defaultFaqs);
      faqs = await Faq.find().sort({ order: 1 });
    }

    res.status(200).json({
      status: 'success',
      data: faqs
    });
  } catch (error) {
    next(error);
  }
};

// Admin create a new FAQ
export const createFaqAdmin = async (req, res, next) => {
  try {
    const { question, answer, category, order, isActive } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        status: 'fail',
        message: 'Question and answer are required'
      });
    }

    const faq = await Faq.create({
      question,
      answer,
      category: category || 'General',
      order: typeof order === 'number' ? order : 0,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      status: 'success',
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

// Admin update an FAQ
export const updateFaqAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, category, order, isActive } = req.body;

    const faq = await Faq.findByIdAndUpdate(
      id,
      { question, answer, category, order, isActive },
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({
        status: 'fail',
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

// Admin delete an FAQ
export const deleteFaqAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await Faq.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({
        status: 'fail',
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

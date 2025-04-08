// "use client";

// import React, { useState } from 'react';

// interface FormValues {
//   email: string;
//   subject: string;
//   message: string;
// }

// const Contact: React.FC = () => {
//   const [formValues, setFormValues] = useState<FormValues>({
//     email: '',
//     subject: '',
//     message: ''
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { id, value } = e.target;
//     setFormValues({ ...formValues, [id]: value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log(formValues);
//     alert("Successfully form submited");
//   };



//   return (
//       <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full mx-4">
//         <h2 className="mb-6 text-4xl font-bold text-center text-blue-700 dark:text-white">
//           Contact Us
//         </h2>
//         <p className="mb-8 text-center text-gray-500 dark:text-gray-400 text-lg">
//           Have a question or need assistance with your fitness journey? We're here to help!
//         </p>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
//               Your Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={formValues.email}
//               onChange={handleInputChange}
//               className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150 ease-in-out"
//               placeholder="name@company.com"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
//               Subject
//             </label>
//             <input
//               type="text"
//               id="subject"
//               value={formValues.subject}
//               onChange={handleInputChange}
//               className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150 ease-in-out"
//               placeholder="Let us know how we can help you"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
//               Your Message
//             </label>
//             <textarea
//               id="message"
//               value={formValues.message}
//               onChange={handleInputChange}
//               rows={5}
//               className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150 ease-in-out"
//               placeholder="Leave a comment..."
//               required
//             />
//           </div>
//           <div className="flex justify-center">
//             <button
//               type="submit"
//               className="py-3 px-6 text-sm font-medium text-white bg-blue-700 rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150 ease-in-out dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//             >
//               Send Message
//             </button>
//           </div>
//         </form>
//       </div>
//   );
// };

// export default Contact;

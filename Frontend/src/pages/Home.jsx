
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import U_Categories from "../components/User_Categories";


function HomePage(){
    return(
        <>
        <Navbar/>
        <Hero/>
                <section
        id="categories"
        className="..."
        >
        <U_Categories/>
        </section>

        <Footer/>
        </>
    )
}
export default HomePage;
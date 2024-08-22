import Home from "./Home"
import NoSsrWrapper from "./NoSsrWrapper"

const Wrapper = () => {
    return (
        <NoSsrWrapper>
            <Home />
        </NoSsrWrapper>
    )
}
export default Wrapper;

